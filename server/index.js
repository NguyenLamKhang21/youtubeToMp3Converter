const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
// use exec with child_process to run commands prompt commands from inside
//your code like my server have its own cmd
const path = require("path"); // help to find path to !!downloads!!
const { v4: uuidv4 } = require("uuid");
const { error } = require("console");

const app = express();
//turning cors on
app.use(cors());
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
  console.log("this is the cleanURL", cleanUrl);

  //lọc xong r thì nối lại link
  const safeUrl = cleanUrl.toString(); // có toString() thì biến nó thành dạng string và chỉ lấy ra phần origin có link
  console.log("this is the safeURl", safeUrl);

  const fileName = uuidv4();
  const outputPath = path.join(__dirname, "downloads", fileName);
  console.log("file name: ", outputPath);
  //xiu test what will happended if i don't convert it to mp3?
  const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}.%(ext)s" "${safeUrl}"`;
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
        file: `${fileName}.mp3`,
      });
    },
    console.log(title),
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

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: "can't retrieve the vid title",
        details: stderr,
      });
    }

    console.log(`heyyy heyyy got the title ready bitch ass ${stdout.trim()}`);

    //suecces
    res.json({
      message: `title retrieve successfully: ${stdout.trim()}`,
      title: stdout.trim(),
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
