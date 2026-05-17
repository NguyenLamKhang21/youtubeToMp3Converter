const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
// use exec with child_process to run commands prompt commands from inside
//your code like my server have its own cmd
const path = require("path"); // help to find path to !!downloads!!
const { error } = require("console");
const fs = require("fs");

const app = express();
//turning cors on
app.use(cors()); //allow all origins
//tell the server to expect json data from the UI
app.use(express.json());

app.use("/files", express.static(path.join(__dirname, "downloads")));

//chỉ tải audio (nếu mà thêm cái lấy title ở đây thì nó ko đc do phải tải với convert sang mp3 trên server
// xong mới biết được tên video :)))))) không tải thì đm chỉ biết
//cái url
app.post("/download_audio", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "no URL provided" });
  }

  //bỏ đi query parameter thuộc dạng list với index do hiện tại chức năng của server bây giờ là chỉ tải 1 vid đơn lẻ
  //chứ không phải tải playlist
  const cleanUrl = new URL(url); // url dạng object
  cleanUrl.searchParams.delete("list");
  cleanUrl.searchParams.delete("index");
  const videoId = cleanUrl.searchParams.get("v"); // lấy ra id định danh duy nhất của mỗi vidoe

  // console.log("this is the cleanURL", cleanUrl);

  //lọc xong r thì nối lại link
  const safeUrl = cleanUrl.toString(); // có toString() thì biến nó thành dạng string và chỉ lấy ra phần origin có link
  // console.log("this is the safeURl", safeUrl);

  //lưu cái id đó thành fileName r lưu trên server

  const filePath = path.join(__dirname, "downloads", `${videoId}`);

  if (fs.existsSync(filePath + ".mp3")) {
    // File already exists! Skip downloading, just return the existing file
    return res.json({
      message: "ready to download",
      file: `${videoId}.mp3`,
    });
  }

  // console.log("file name: ", filePath);

  const command = `yt-dlp -x --audio-format mp3 -o "${filePath}.%(ext)s" "${safeUrl}"`;
  //-x mean extract audio only
  //then convert it into mp3

  exec(
    command,
    { maxBuffer: 1024 * 1024 * 10, timeout: 120000 },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: "download fail man :(",
          details: stderr,
        });
      }

      // success — send the file info back
      res.json({
        // thử log ra bên app.js
        message: "Audio Ready to Download successful",
        file: `${videoId}`,
      });
    },
  );
});

app.post("/download_video", (req, res) => {
  const { url, quality } = req.body;

  if (!url || !quality) {
    return res.status(400).json({ error: "no URL or quality provided" });
  }
  const cleanURL = new URL(url);
  cleanURL.searchParams.delete("list");
  cleanURL.searchParams.delete("index");
  // lấy ra vid ID
  const videoId = cleanURL.searchParams.get("v");
  console.log("video ID: ", videoId);

  const safeURl = cleanURL.toString();

  //temp files delete after merge (v là thay vì lấy audio ra từ server
  //thì nó sẽ chạy 2 lệnh 1 cái lấy mỗi video và 1 cái lấy mỗi audio
  //từ youtube. Thay vì cách t nghĩ là chỉ cần lấy mỗi video th
  //còn audio thì dựa vào cái video ID của audio mà lấy ra
  //gộp với cái video. Bớt 1 lệnh phải tải và xoá trên server
  // )
  const videoTempPath = path.join(
    __dirname,
    "downloads",
    `${videoId}_video_temp.mp4`,
  );
  const audioTempPath = path.join(
    __dirname,
    "downloads",
    `${videoId}_audio_temp.m4a`,
  );

  const QUALITY_MAP = {
    "720p":
      "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]",
    "1080p":
      "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
    "4k": "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]",
  };

  const HEIGHT_MAP = { "720p": 720, "1080p": 1080, "4k": 2160 };
  //mé cái này lúc đầu AI gen ra t không biết dùng ở đâu :))) ai ngờ bây giờ hỏi lại
  //thì mới biết là nó dùng cho khúc ở height<=1080 ==> height<=${videoFormat} :)))) vclllll thật
  const videoFormat = QUALITY_MAP[quality] || QUALITY_MAP["720p"];
  const height = HEIGHT_MAP[quality] || 1080;
  console.log("height htingy: ", height);

  //final merge and then delete the temp above

  const finalPath = path.join(
    __dirname,
    "downloads",
    `${videoId}_${HEIGHT_MAP[quality]}`,
  );
  console.log("final Pathh ", finalPath);

  if (fs.existsSync(finalPath + ".mp4")) {
    return res.json({
      //tí t thử log ra cái này xem
      message: "video already to on servers",
      file: `${videoId}_${HEIGHT_MAP[quality]}.mp4`,
    });
  }

  const videoCmd = `yt-dlp -f "bestvideo[height<=${height}][ext=mp4]" -o "${videoTempPath}" "${safeURl}"`;
  const audioCmd = `yt-dlp -f "bestaudio[ext=m4a]" -o "${audioTempPath}" "${safeURl}"`;
  const mergeCmd = `ffmpeg -i "${videoTempPath}" -i "${audioTempPath}" -c:v copy -c:a copy "${finalPath}.mp4"`;
  // -c:v copy = don't re-encode video (keeps quality, saves CPU)
  // -c:a copy = don't re-encode audio (same reason)

  exec(videoCmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: "Video download failed",
        details: stderr,
      });
    }
    exec(audioCmd, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: "Audio download failed",
          details: stderr,
        });
      }
      exec(mergeCmd, (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({
            error: "Merged faield",
            details: stderr,
          });
        }
        fs.unlinkSync(videoTempPath);
        fs.unlinkSync(audioTempPath);
        res.json({
          // thử log ra bên app.js
          file: `${videoId}__${quality}.mp4`,
          message:
            "done downloading and mergin the video and audio and remove the tmp",
        });
      });
    });
  });
});

//chỉ dùng để lấy ra title
app.post("/get-title", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "no URL provided CUNT" });
  }

  //bỏ đi query parameter thuộc dạng list với index do hiện tại chức năng của server bây giờ là chỉ tải 1 vid đơn lẻ
  //chứ không phải tải playlist
  const cleanUrl = new URL(url); // url dạng object
  cleanUrl.searchParams.delete("list");
  cleanUrl.searchParams.delete("index");

  //lọc xong r thì nối lại link
  const safeUrl = cleanUrl.toString(); // có toString() thì biến nó thành dạng string và chỉ lấy ra phần origin có link
  const command = `yt-dlp -e "${safeUrl}"`;

  exec(
    command,
    { encoding: "utf-8", env: { ...process.env, PYTHONIOENCODING: "utf-8" } },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: "can't retrieve the vid title",
          details: stderr,
        });
      }

      // console.log(
      //   `heyyy heyyy got the title ready bitch ass: ${stdout.trim()}`,
      // );

      //suecces
      res.json({
        message: `title retrieve successfully: ${stdout.trim()}`,
        title: stdout.trim(),
      });
    },
  );
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
