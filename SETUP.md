# 🎵 YouTube to MP3 / MP4 Converter — Setup Guide

A full-stack app that lets you convert YouTube videos to MP3 audio or MP4 video at various quality levels (720p, 1080p, 4K).

---

## 📋 Prerequisites

Before you start, make sure you have all of these installed on your machine:

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org/

Verify install:
```bash
node -v
npm -v
```

### 2. yt-dlp
A command-line tool used by the server to download YouTube videos/audio.

**Windows:**
```bash
winget install yt-dlp
```
Or download the `.exe` directly from: https://github.com/yt-dlp/yt-dlp/releases

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
sudo apt install yt-dlp
# or
pip install yt-dlp
```

Verify install:
```bash
yt-dlp --version
```

### 3. FFmpeg
Used by the server to merge the video and audio streams together into a final `.mp4` file.

**Windows:**
Download from: https://ffmpeg.org/download.html  
Then add the `bin` folder to your system's PATH environment variable.

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

Verify install:
```bash
ffmpeg -version
```

> ⚠️ **Important:** Both `yt-dlp` and `ffmpeg` must be accessible from the command line (i.e., in your PATH). If the server can't find them, downloads will fail.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/NguyenLamKhang21/youtubeToMp3Converter.git
cd youtubeToMp3Converter
```

### 2. Set up the Server
```bash
cd server
npm install
```

Create the downloads folder (the server stores downloaded files here):
```bash
mkdir downloads
```

Start the server:
```bash
node index.js
```

The server will run on **http://localhost:5000**

### 3. Set up the Client
Open a **new terminal window**, then:
```bash
cd client
npm install
npm start
```

The React app will open automatically at **http://localhost:3000**

---

## 📁 Project Structure

```
youtubeToMp3Converter/
├── client/               # React frontend
│   └── src/
│       ├── App.js        # Main app logic and UI
│       └── App.css       # Styling
└── server/               # Express backend
    ├── index.js          # Server routes (download, convert, merge)
    └── downloads/        # Where converted files are stored
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/get-title` | Fetches the YouTube video title |
| `POST` | `/download_audio` | Downloads and converts to MP3 |
| `POST` | `/download_video` | Downloads video + audio and merges to MP4 |
| `GET`  | `/files/:filename` | Serves a converted file for download |

---

## 💡 How to Use

1. Paste a YouTube URL into the input field
2. The video **title** and **thumbnail** will auto-load after 1 second
3. To get **MP3**: click **"Convert to MP3"**
4. To get **MP4**: select a quality (720p / 1080p / 4K) then click **"Download Video"**
5. Once processing is done, click the download button to save the file

---

## ⚠️ Common Issues

**Server crashes on download:**
- Make sure `yt-dlp` and `ffmpeg` are installed and in your PATH
- Run `yt-dlp --update` to make sure you have the latest version (YouTube changes frequently break older versions)

**400 Bad Request on `/download_video`:**
- Make sure a quality option is selected before clicking Download Video

**File not found after download:**
- Make sure the `server/downloads/` folder exists. Create it manually if needed:  
  `mkdir server/downloads`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 |
| Backend | Node.js + Express 5 |
| YouTube download | yt-dlp |
| Audio/Video merge | FFmpeg |
| Cross-origin | CORS |
