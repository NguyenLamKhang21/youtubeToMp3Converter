# Use a lightweight Node.js base image
FROM node:20-bookworm-slim

# Install system dependencies (ffmpeg, python3, python-is-python3, and curl)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python-is-python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary globally
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency configuration files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Install the yt-dlp PO token plugin
RUN pip3 install -U bgutil-ytdlp-pot-provider

# Copy the rest of the application source code
COPY . .

# Create the downloads directory
RUN mkdir -p downloads

# Bind the server to port 5000 (Render will supply this via PORT env variable)
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
