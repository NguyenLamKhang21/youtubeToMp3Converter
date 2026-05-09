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

//chỉ tải audio (nếu mà thêm cái lấy title ở đây thì nó ko đc do phải tải xong mới biết được tên video :)))))) không tải thì đm chỉ biết
//cái url
app.post("/download", (req, res) => {
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
  console.log("this is the cleanURL", cleanUrl);

  //lọc xong r thì nối lại link
  const safeUrl = cleanUrl.toString(); // có toString() thì biến nó thành dạng string và chỉ lấy ra phần origin có link
  console.log("this is the safeURl", safeUrl);

  //lưu cái id đó thành fileName r lưu trên server

  const filePath = path.join(__dirname, "downloads", `${videoId}`); //hieur la filePaht

  if (fs.existsSync(filePath)) {
    // File already exists! Skip downloading, just return the existing file
    return res.json({
      message: "ready to download",
      file: `${videoId}.mp3`,
    });
  }

  console.log("file name: ", filePath);

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
        message: "Download successful",
        file: `${videoId}.mp3`,
      });
    },
  );
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

      console.log(
        `heyyy heyyy got the title ready bitch ass: ${stdout.trim()}`,
      );

      //suecces
      res.json({
        message: `title retrieve successfully: ${stdout.trim()}`,
        title: stdout.trim(),
      });
    },
  );
});
//dùng lệnh dưới đây để post lấy thumbnail, nhớ phải lọc cái url trc không thì nó tải hết playlist đấy
//yt-dlp --write-thumbnail --skip-download -o "E:\HobbyProject\youtubeToMp3Converter\server\test thumbnail\%(title)s.%(ext)s" "https://www.youtube.com/watch?v=lHLJkdqnhak
app.p;

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
