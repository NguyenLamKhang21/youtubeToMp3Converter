import { useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [videoTitle, setVideoTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [downloadTitle, setDownloadTitle] = useState("");

  const handleDownload = async () => {
    if (!url) {
      setStatus("pasue");
      return;
    }

    setStatus("downloading");
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
      setDownloadTitle(tittleData.title);

      setStatus("downloading");

      if (titleRes.ok) {
        //after link good just show title so this bye bye?
        setFileName(tittleData.file);
        // setDownloadTitle(data.title);
        setStatus("done");
        console.log(tittleData.title);
      } else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  //
  const handleSaveFile = async () => {
    const fileUrl = `http://localhost:5000/files/${fileName}`;
    const res = await fetch(fileUrl);
    const blob = await res.blob(); //chuyển dạng mp3 sang raw binary data
    const blobUrl = URL.createObjectURL(blob); //creates a temporary invisible URL for that blob

    const link = document.createElement("a"); //creates an invisible download link in memory
    link.href = blobUrl;
    link.download = `${downloadTitle}.mp3`;
    link.click();

    URL.revokeObjectURL(blobUrl); //dùng xong bỏ
  };

  //extract the title from the url to show after use finish pasting / typing the url in
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
            method: "POST",
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
      <h1>Youtube to MP3 converter chigga</h1>
      <p>Video Title: {videoTitle}</p>
      {/* instead of showing the url, it will show the title of the video 
      DONE DONE DONE DONE DONE DONE DONE DONE DONE DONE DONE DONEDONE DONE DONE  */}

      <input
        type="text"
        placeholder="paste Youtube url here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleDownload}>Convert to MP3</button>

      {status === "idle" && <p>Enter a Youtube URL to get started.</p>}
      {status === "fetching" && <p>Fetching vid info</p>}
      {status === "downloading" && (
        <p>the video is downloading please wait {downloadTitle}</p>
      )}
      {status === "done" && (
        <div>
          <p>Done your MP3 is ready to go buckaroo</p>
          {/* cái lòn title này t lấy ra từ khúc ở useEffect được không hay là nó
          chỉ local? */}
          <button onClick={handleSaveFile}>Download MP3</button>
        </div>
      )}
      {status === "error" && (
        <p>something went wrong please check the URL and try again</p>
      )}
    </div>
  );
}

export default App;
