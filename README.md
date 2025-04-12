# FastDownloadLK Backend

Backend server for FastDownloadLK - A social media video downloader.

## Features

- Download videos from YouTube, Facebook, Instagram, and TikTok
- Multiple quality options
- Fast downloads
- Cross-platform support

## Requirements

- Node.js >= 18.0.0
- yt-dlp installed on the system

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on port 3000 by default.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: Frontend URL for CORS (default: *)

## Deployment

This project is configured for deployment on Render.com. Simply connect your GitHub repository to Render and it will automatically deploy using the configuration in `render.yaml`.

## Railway Deployment

This project can also be deployed on Railway.app using the following steps:

1. Fork this repository to your GitHub account
2. Create a new project on Railway.app
3. Connect your GitHub repository to Railway
4. Railway will automatically detect the `railway.toml` configuration
5. The deployment will start automatically

The `railway.toml` file includes:
- Build configuration using Nixpacks
- Automatic health checks
- Environment variable configuration
- Restart policies for reliability

You can monitor your deployment status and logs in the Railway dashboard.

Note: Make sure to set up the following environment variables in your Railway project:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Set to "production"
- Any other environment variables required by your application 