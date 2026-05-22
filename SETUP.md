# 🎵 YouTube to MP3 / MP4 Converter — Setup Guide

A full-stack app that lets you convert YouTube videos to MP3 audio or MP4 video at various quality levels (720p, 1080p, 4K).

The Express backend serves both the API and the React frontend as a single process — no separate dev servers needed in production.

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

### 2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Choose how to run it

You have two options: **Development mode** (for making code changes) or **Production mode** (for actual use / self-hosting).

---

## 🔧 Development Mode

Use this when you're actively editing the code and want hot-reload on the frontend.

**Terminal 1 — Start the server:**
```bash
cd server
node index.js
```

**Terminal 2 — Start the React dev server:**
```bash
cd client
npm start
```

The React dev server runs at **http://localhost:3000** and the API server runs at **http://localhost:5000**.

> ⚠️ In development mode, you'll need a `client/.env` file so the React dev server knows where the API is:
> ```
> REACT_APP_API_URL=http://localhost:5000
> ```
> And you'll need to update the `fetch()` calls in `App.js` to use `${process.env.REACT_APP_API_URL}` as the base URL instead of relative paths.

---

## 🚀 Production Mode

In production, Express serves both the API and the React frontend from a single process on **one port**. No separate React dev server needed.

### 1. Build the React frontend
```bash
cd client
npm run build
```

This creates a `client/build/` folder with optimized static files (HTML, CSS, JS).

### 2. Start the server
```bash
cd server
node index.js
```

### 3. Open the app
Open **http://localhost:5000** in your browser. The Express server serves the React UI and handles all API requests on the same port.

---

## 🌐 Self-Hosting (Share With Friends Over the Internet)

Want your friends to use your app from anywhere? Use [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose your local server to the internet — no port forwarding needed, free HTTPS included, and your residential IP helps avoid YouTube bot detection.

### Prerequisites
- Your app running in **production mode** (see above)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed on your machine

**Install cloudflared:**

Windows:
```bash
winget install --id Cloudflare.cloudflared
```

macOS:
```bash
brew install cloudflared
```

Linux:
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

### Option A: Quick Tunnel (Temporary URL, no account needed)

The fastest way to share — generates a random public URL that lasts as long as the command runs.

**Terminal 1:**
```bash
cd server
node index.js
```

**Terminal 2:**
```bash
cloudflared tunnel --url http://localhost:5000
```

Cloudflare will output a URL like `https://random-words.trycloudflare.com`. Send it to your friend — they can use it immediately.

> ⚠️ The URL changes every time you restart the tunnel and dies when you close the terminal.

### Option B: Named Tunnel (Permanent URL with custom domain)

For a stable URL that never changes. Requires a Cloudflare account (free) and a domain name.

1. **Authenticate:** `cloudflared tunnel login`
2. **Create tunnel:** `cloudflared tunnel create ytdl-converter`
3. **Create config file** at `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <YOUR-TUNNEL-ID>
   credentials-file: <PATH-TO-TUNNEL-ID>.json

   ingress:
     - hostname: ytdl.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```
4. **Route DNS:** `cloudflared tunnel route dns ytdl-converter ytdl.yourdomain.com`
5. **Run tunnel:** `cloudflared tunnel run ytdl-converter`

Your app is now permanently available at `https://ytdl.yourdomain.com`.

---

## 📁 Project Structure

```
youtubeToMp3Converter/
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main app logic and UI
│   │   └── App.css        # Styling
│   └── build/             # Production build (generated by npm run build)
├── server/                # Express backend
│   ├── index.js           # API routes + serves React build in production
│   ├── Dockerfile         # Docker config for containerized deployment
│   └── downloads/         # Where converted files are temporarily stored
├── SETUP.md               # This file
└── .gitignore
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

**403 errors or "Sign in to confirm you're not a bot":**
- Update yt-dlp: `yt-dlp --update`
- If running from a cloud server/VPS, YouTube may be blocking the datacenter IP — self-hosting from a residential connection works best

**400 Bad Request on `/download_video`:**
- Make sure a quality option is selected before clicking Download Video

**File not found after download:**
- The `server/downloads/` folder is created automatically on server start. If it's missing for some reason, create it manually: `mkdir server/downloads`

**Blank page on `localhost:5000` in production mode:**
- Make sure you ran `npm run build` in the `client/` folder first

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 |
| Backend | Node.js + Express 5 |
| YouTube download | yt-dlp |
| Audio/Video merge | FFmpeg |
| Tunneling (optional) | Cloudflare Tunnel |
