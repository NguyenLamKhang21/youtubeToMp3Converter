import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [videoTitle, setVideoTitle] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [quality, setQuality] = useState("720p");

  //convert sang mp3 cho user tải về
  const handlveAudioSave = async () => {
    // lấy file ra ở server r fetch về chuyển từ mp3 sang raw binary data r cho tải
    const fileUrl = `http://localhost:5000/files/${audioFileName}`;
    const res = await fetch(fileUrl);
    const blob = await res.blob(); //chuyển dạng mp3 sang raw binary data
    const blobUrl = URL.createObjectURL(blob); //creates a temporary invisible URL for that blob

    const link = document.createElement("a"); //creates an invisible download link in memory
    link.href = blobUrl;
    link.download = `${videoTitle || "download"}.mp3`;
    link.click();

    URL.revokeObjectURL(blobUrl); //dùng xong bỏ
  };

  //convert sang mp4 và cho user tải về
  const handleVideoSave = async () => {
    // lấy file ra ở server r fetch về chuyển từ mp3 sang raw binary data r cho tải
    const fileUrl = `http://localhost:5000/files/${videoFileName}`;
    console.log(fileUrl);
    const res = await fetch(fileUrl);
    const blob = await res.blob(); //chuyển dạng mp3 sang raw binary data
    const blobUrl = URL.createObjectURL(blob); //creates a temporary invisible URL for that blob

    const link = document.createElement("a"); //creates an invisible download link in memory
    link.href = blobUrl;
    link.download = `${videoTitle || "download"}.mp4`;
    link.click();

    URL.revokeObjectURL(blobUrl); //dùng xong bỏ
  };

  const handleVideo = async (quality) => {
    setStatus("idle");
    if (!url || !quality) {
      setStatus(`oiiii video thingy ain't wokring cuhh url:`);
      return;
    }

    try {
      setStatus("tryna get the vid");

      const vidRes = await fetch("http://localhost:5000/download_video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, quality }),
      });

      const vidData = await vidRes.json();

      if (vidRes.ok) {
        setVideoFileName(vidData.file);
        setStatus("done");
        console.log("oyyy oyyy it work yet??: ", vidData.message);
      } else {
        console.log(vidRes.message);
      }
    } catch (err) {
      setStatus("oiii oii err in vid mate: ", err);
    }
  };

  const handleAudio = async () => {
    setStatus("idle");
    if (!url) {
      setStatus("pasue");
      return;
    }

    //try to show the percentage of download and time till finish later
    try {
      setStatus("fetching");

      const titleRes = await fetch("http://localhost:5000/download_audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const tittleData = await titleRes.json();

      if (titleRes.ok) {
        //after link good just show title so this bye bye?
        setAudioFileName(tittleData.file);
        // setDownloadTitle(data.title);
        setStatus("done");
        console.log("Download done, title:", videoTitle);
        console.log("testing testing ", tittleData.message);
        console.log("testing testing file name gang", tittleData.file);
      } else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  //extract the title from the url to show after user finish pasting / typing the url in
  //add a dnbounce pattern in so that it will honly show the title of URL after a set ammount of time
  //only in use when the url change if not then mehhhh
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const parsed = new URL(url);
        const videoId = parsed.searchParams.get("v");
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      } catch (error) { }

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
        <h1>Youtube to MP3 / video MP4 converter</h1>
        {status === "idle" && (
          <div className="input-group">
            <input
              type="text"
              placeholder="paste Youtube url here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {/* sau khi user bỏ link vào xong thì fetch cái title hiện ra, với cái thumbnail nx */}
            <div className="thumbnail-title">
              {thumbnailUrl && <img src={thumbnailUrl} alt="Video thumbnail" />}
              <p>{videoTitle}</p>
            </div>

            <button onClick={handleAudio}>Convert to MP3</button>

            <select
              name="quality"
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value={"720p"}>MP4 - 720p HD</option>
              <option value={"1080p"}>MP4 - 1080p FHD</option>
              <option value={"4k"}>MP4 - 4k</option>
            </select>

            <button onClick={() => handleVideo(quality)}>
              download Vidoeo
            </button>
            {/* tai sao nó chạy ra cái handle vidoe trước v???? */}

            <p className="p-center">Enter a Youtbe URL to start downloading</p>
          </div>
        )}
        {status === "fetching" && (
          <>
            <div className="spinner"></div>
            <p>fetching info from server: {videoTitle}</p>
          </>
        )}
        {status === "done" && (
          <div className="result">
            <p>Done your MP3 is ready to go buckaroo click below to download</p>
            <h3>{videoTitle}</h3>

            <div className="download-thumbnail">
              {thumbnailUrl && <img src={thumbnailUrl} alt="Video thumbnail" />}
            </div>
            <button className="download-btn" onClick={handlveAudioSave}>
              Download MP3
            </button>
            <button className="download-btn" onClick={handleVideoSave}>
              Download video in MP4 BABY
            </button>
            <button
              className="rest-btn"
              onClick={() => {
                setStatus("idle");
                setUrl("");
                setVideoTitle("");
                setAudioFileName("");
                setVideoFileName("");
                setThumbnailUrl("");
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
