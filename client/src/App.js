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
    const fileUrl = `/files/${audioFileName}`;
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
    const fileUrl = `/files/${videoFileName}`;
    console.log("video file name: ", videoFileName);
    console.log(fileUrl);
    const res = await fetch(fileUrl);
    const blob = await res.blob(); //chuyển dạng mp3 sang raw binary data
    const blobUrl = URL.createObjectURL(blob); //creates a temporary invisible URL for that blob

    const link = document.createElement("a"); //creates an invisible download link in memory
    link.href = blobUrl;
    link.download = `${videoTitle || "download"}_${quality}.mp4`;
    setQuality("");
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
      setStatus("fetching");

      const vidRes = await fetch(
        `/download_video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, quality }),
        },
      );

      const vidData = await vidRes.json();

      if (vidRes.ok) {
        setVideoFileName(vidData.file);
        setStatus("videoDone");
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

      const titleRes = await fetch(
        `/download_audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        },
      );

      const tittleData = await titleRes.json();

      if (titleRes.ok) {
        //after link good just show title so this bye bye?
        setAudioFileName(tittleData.file);
        setStatus("aduioDone");
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
    if (!url) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const parsed = new URL(url);
        const videoId = parsed.searchParams.get("v");
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      } catch (error) { }

      const fetchTitle = async () => {
        try {
          const res = await fetch(
            `/get-title`,
            {
              method: "POST", //option request for preflight
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url }),
            },
          );

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
        <h2>YouTube to MP3/MP4</h2>
        {status === "idle" && (
          <div className="input-group">
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {/* sau khi user bỏ link vào xong thì fetch cái title hiện ra, với cái thumbnail nx */}
            {thumbnailUrl && (
              <div className="thumbnail-title">
                <img src={thumbnailUrl} alt="Video thumbnail" />
                <p>{videoTitle}</p>
              </div>
            )}

            <button className="convert-audio-btn" onClick={handleAudio}>
              <span className="material-symbols-outlined">audio_file</span> Convert to MP3
            </button>

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

            <button className="convert-video-btn" onClick={() => handleVideo(quality)}>
              <span className="material-symbols-outlined">video_file</span> Download Video
            </button>

            <p className="p-center">Enter a YouTube URL to start downloading</p>
          </div>
        )}
        {status === "fetching" && (
          <div className="result">
            <div className="spinner"></div>
            <h3>Processing...</h3>
            <p className="p-center">fetching info from server: <strong>{videoTitle}</strong></p>
          </div>
        )}
        {status === "aduioDone" && (
          <div className="result">
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--primary)" }}>check_circle</span>
            <h3>Conversion Complete!</h3>
            <p className="p-center">{videoTitle}</p>

            <div className="download-thumbnail">
              {thumbnailUrl && <img src={thumbnailUrl} alt="Video thumbnail" />}
            </div>
            <button className="download-btn" onClick={handlveAudioSave}>
              <span className="material-symbols-outlined">download</span> Download MP3
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
              }}
            >
              Convert Another
            </button>
          </div>
        )}
        {status === "videoDone" && (
          <div className="result">
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--primary)" }}>check_circle</span>
            <h3>Conversion Complete!</h3>
            <p className="p-center">{videoTitle}</p>

            <div className="download-thumbnail">
              {thumbnailUrl && <img src={thumbnailUrl} alt="Video thumbnail" />}
            </div>
            <button className="download-btn" onClick={handleVideoSave}>
              <span className="material-symbols-outlined">download</span> Download Video
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
              }}
            >
              Convert Another
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="result text-center">
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--accent-red)" }}>error</span>
            <h3>Something Went Wrong</h3>
            <p>Please check the URL and try again</p>
            <button
              className="rest-btn"
              onClick={() => {
                setStatus("idle");
                setUrl("");
                setVideoTitle("");
                setAudioFileName("");
                setVideoFileName("");
                setThumbnailUrl("");
              }}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
