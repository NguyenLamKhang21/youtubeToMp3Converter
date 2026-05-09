import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [videoTitle, setVideoTitle] = useState("");
  const [fileName, setFileName] = useState("");

  //convert sang mp3
  const handleSaveFile = async () => {
    const fileUrl = `http://localhost:5000/files/${fileName}`;
    const res = await fetch(fileUrl);
    const blob = await res.blob(); //chuyển dạng mp3 sang raw binary data
    const blobUrl = URL.createObjectURL(blob); //creates a temporary invisible URL for that blob

    const link = document.createElement("a"); //creates an invisible download link in memory
    link.href = blobUrl;
    link.download = `${videoTitle || "download"}.mp3`;
    link.click();

    URL.revokeObjectURL(blobUrl); //dùng xong bỏ
  };

  const handleDownload = async () => {
    if (!url) {
      setStatus("pasue");
      return;
    }

    //try to show the percentage of download and time till finish later
    try {
      setStatus("fetching");

      const titleRes = await fetch("http://localhost:5000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const tittleData = await titleRes.json();

      if (titleRes.ok) {
        //after link good just show title so this bye bye?
        setFileName(tittleData.file);
        // setDownloadTitle(data.title);
        setStatus("done");
        console.log("Download done, title:", videoTitle);
        //ở khúc này đang bị lỗi không lấy ra đợc title để gán lên tên file download
        //lấy đc r
        console.log("vid cos sanx r", tittleData.file);
      } else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  //extract the title from the url to show after user finish pasting / typing the url in
  //add a dnbounce pattern in so that it will honly show the title of URL after a set ammount of time
  //only in use when the url change if not then mehhhh
  useEffect(() => {
    if (!url) {
      return;
    }
    const timer = setTimeout(() => {
      const fetchTitle = async () => {
        try {
          const res = await fetch("http://localhost:5000/get-title", {
            method: "POST", //option request for preflight
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          });

          const data = await res.json();

          if (res.ok) {
            setVideoTitle(data.title);
            console.log("it worked dawg");
          } else console.log("can't get the title bruhh");
        } catch (error) {
          setStatus("oyyy sth went wrong ehh");
        }
      };
      fetchTitle();
    }, 1000);
    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <div className="background">
      <div className="converter-card">
        <h1>Youtube to MP3 converter chigga</h1>

        {status === "idle" && (
          <div className="input-group">
            <input
              type="text"
              placeholder="paste Youtube url here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleDownload}>Convert to MP3</button>
            <p>Enter a Youtbe URL to start downloading</p>
          </div>
        )}
        {status === "fetching" && (
          <>
            <div className="spinner"></div>
            <p>the video is downloading: {videoTitle}</p>
          </>
        )}
        {status === "done" && (
          <div className="result">
            <h3>{videoTitle}</h3>
            <p>Done your MP3 is ready to go buckaroo</p>
            <button className="download-btn" onClick={handleSaveFile}>
              Download MP3
            </button>
            <button
              className="rest-btn"
              onClick={() => {
                setStatus("idle");
                setUrl("");
                setVideoTitle("");
                setFileName("");
                //user ấn tải xong thì mình wipe cho clear những giá trị trước đó
                //là rỗng cho input mới với lần tải
              }}
            >
              Convert Another
            </button>
          </div>
        )}
        {status === "error" && (
          <p>something went wrong please check the URL and try again</p>
        )}
      </div>
    </div>
  );
}

export default App;
