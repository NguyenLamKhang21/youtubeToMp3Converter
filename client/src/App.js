import { useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [fileName, setFileName] = useState("");

  const handleDownload = async () => {
    if (!url) {
      setStatus("error");
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

  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <div>
      <h1>Youtube to MP3 converter chigga</h1>
      <p>Current URL value: {url}</p>
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
        <p>the video has finished downloading {fileName}</p>
      )}
      {status === "error" && (
        <p>something went wrong please check the URL and try again</p>
      )}
    </div>
  );
}

export default App;
