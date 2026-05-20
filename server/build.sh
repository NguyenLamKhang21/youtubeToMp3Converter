#!/usr/bin/env bash
# This script runs during Render's build phase

# 1. Install Node dependencies
npm install

# 2. Install ffmpeg (available via apt on Render)
apt-get update && apt-get install -y ffmpeg

# 3. Install yt-dlp (download the latest binary)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
chmod chmod a+rx ./yt-dlp

# 4. Create downloads directory
mkdir -p downloads

echo "✅ Build complete: ffmpeg and yt-dlp installed"
