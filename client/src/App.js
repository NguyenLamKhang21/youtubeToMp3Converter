import { useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const handleDownload = async () => {
    if (!url) {
      setStatus("pasue");
      return;
    }

    setStatus("downloading");
    //try to show the percentage of download and time till finish later
    try {
      const res = await fetch("http://localhost:5000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok) {
        setFileName(data.file);
        setStatus("done");
      } else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  //extract the title from the url to show after use finish pasting / typing the url in
  //add a dnbounce pattern in so that it will honly show the title of URL after a set ammount of time
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <div>
      <h1>Youtube to MP3 converter chigga</h1>
      <p>Current URL value: {videoTitle}</p>
      {/* instead of showing the url, it will show the title of the video */}

      <input
        type="text"
        placeholder="paste Youtube url here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleDownload}>Convert to MP3</button>

      {status === "idle" && <p>Enter a Youtube URL to get started.</p>}
      {status === "downloading" && <p>the video is downloading please wait</p>}
      {status === "done" && (
        <div>
          <p>Done your MP3 is ready to go buckaroo</p>
          <a href={`http://localhost:5000/files/${fileName}`} download>
            <button>Download MP3</button>
          </a>
        </div>
      )}
      {status === "error" && (
        <p>something went wrong please check the URL and try again</p>
      )}
    </div>
  );
}

export default App;
