const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const util = require('util');
require('dotenv').config();

const execPromise = util.promisify(exec);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static('public'));

// Routes
app.get('/api/youtube', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Create a temporary file path
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `video-${Date.now()}.mp4`);

    // Construct yt-dlp command with additional options for reliability
    const ytDlpCommand = [
      'yt-dlp',
      `"${url}"`,
      '--format "bestvideo[height<=256][ext=mp4]+bestaudio[ext=m4a]/best[height<=256][ext=mp4]/best"', // Prefer MP4 format with low resolution
      '--merge-output-format mp4',
      '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"',
      '--no-check-certificates',
      '--no-cache-dir',
      '--progress',
      '--no-warnings',
      '--force-ipv4',
      '--geo-bypass',
      '--ignore-errors',
      '--no-playlist',
      '--add-metadata',
      '--retries 10',
      '--fragment-retries 10',
      '--file-access-retries 10',
      '--no-part',
      '--no-mtime',
      `--output "${outputPath}"`
    ].join(' ');

    console.log('Executing command:', ytDlpCommand);
    
    // Download video using yt-dlp command
    const { stdout, stderr } = await execPromise(ytDlpCommand);
    console.log('Download output:', stdout);
    
    if (stderr) {
      console.error('Download stderr:', stderr);
    }

    // Verify the file exists and has content
    if (!fs.existsSync(outputPath)) {
      throw new Error('Video download failed - file not created');
    }
    
    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      fs.unlinkSync(outputPath);
      throw new Error('Video download failed - empty file created');
    }

    // Try to get video info for the filename, fall back to a default if it fails
    let fileName = `youtube-video-${Date.now()}.mp4`;
    try {
      const infoCommand = `yt-dlp --print "%(title)s" "${url}"`;
      const { stdout: videoTitle } = await execPromise(infoCommand);
      if (videoTitle && videoTitle.trim()) {
        const safeTitle = videoTitle.trim().replace(/[^a-zA-Z0-9]/g, '_');
        fileName = `${safeTitle}.mp4`;
      }
    } catch (err) {
      console.error('Error getting video title:', err);
      // Use default filename
    }

    // Set headers for video download
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.header('Content-Type', 'video/mp4');
    
    // Stream the video file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up the temporary file after streaming
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    });

    // Handle errors during streaming
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to stream video',
          message: err.message
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message,
      details: 'Please try a different video or try again later'
    });
  }
});

app.get('/api/instagram', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    res.json({
      success: true,
      downloadLink: `https://example.com/download?url=${encodeURIComponent(url)}`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.get('/api/tiktok', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    res.json({
      success: true,
      downloadLink: `https://example.com/download?url=${encodeURIComponent(url)}`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.get('/api/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Determine platform
    let platform = 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
    } else if (url.includes('tiktok.com')) {
      platform = 'tiktok';
    } else if (url.includes('facebook.com')) {
      platform = 'facebook';
    }

    // Get video info using yt-dlp command with format listing
    const infoCommand = `yt-dlp -j "${url}"`;  // Changed to -j for single JSON output
    let stdout;
    try {
        const result = await execPromise(infoCommand);
        stdout = result.stdout;
        
        // Check if output is valid JSON
        try {
            const videoInfo = JSON.parse(stdout);
            
            // Filter and prepare available formats
            const formats = [];
            if (videoInfo.formats) {
                // Get unique formats by height
                const uniqueFormats = new Map();
                videoInfo.formats.forEach(format => {
                    // Only include formats with both video and audio, or those that can be merged
                    if (format.height && (format.acodec !== 'none' || format.vcodec !== 'none')) {
                        const height = format.height;
                        let quality;
                        // Define quality labels based on resolution
                        if (height >= 2160) quality = '4K Ultra HD';
                        else if (height >= 1440) quality = '2K Quad HD';
                        else if (height >= 1080) quality = '1080p Full HD';
                        else if (height >= 720) quality = '720p HD';
                        else if (height >= 480) quality = '480p SD';
                        else if (height >= 360) quality = '360p Low';
                        else quality = '240p Low';

                        const formatId = format.format_id;
                        const key = height;

                        if (!uniqueFormats.has(key) || 
                            (format.filesize && format.filesize > uniqueFormats.get(key).filesize)) {
                            uniqueFormats.set(key, {
                                format_id: formatId,
                                height: height,
                                resolution: `${height}p`,
                                quality: quality,
                                format_note: format.format_note || quality,
                                filesize: format.filesize || 0,
                                ext: format.ext || 'mp4',
                                vcodec: format.vcodec,
                                acodec: format.acodec
                            });
                        }
                    }
                });

                // Convert to our format structure
                Array.from(uniqueFormats.values()).forEach(format => {
                    formats.push({
                        format_id: format.format_id,
                        resolution: format.resolution,
                        quality: format.quality,
                        format_note: format.format_note,
                        ext: format.ext,
                        filesize: format.filesize,
                        height: format.height
                    });
                });

                // Sort formats by height (descending)
                formats.sort((a, b) => {
                    const heightA = parseInt(a.resolution);
                    const heightB = parseInt(b.resolution);
                    return heightB - heightA;
                });
            }

            // Return video info as JSON
            res.json({
                title: videoInfo.title || '',
                thumbnail: videoInfo.thumbnail || '',
                duration: videoInfo.duration || '',
                formats: formats,
                platform: platform,
                url: url // Add URL to response for reference
            });

        } catch (e) {
            console.error('Error parsing video info:', e);
            throw new Error('Failed to parse video information');
        }
    } catch (e) {
        console.error('Error executing video info command:', e);
        throw new Error('Failed to get video information');
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to get video information',
      message: error.message,
      detail: 'Please try a different video or try again later'
    });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { url, quality, format } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Create a temporary file path
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `video-${Date.now()}.mp4`);

    // Determine the height based on quality
    let height = 720; // Default to 720p
    if (quality) {
      if (quality.includes('240p')) height = 240;
      else if (quality.includes('360p')) height = 360;
      else if (quality.includes('480p')) height = 480;
      else if (quality.includes('720p')) height = 720;
      else if (quality.includes('1080p')) height = 1080;
      else if (quality.includes('1440p')) height = 1440;
      else if (quality.includes('2160p')) height = 2160;
    }

    // Enhanced format string with fallback options
    const formatOption = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;

    // Construct the yt-dlp command with robust options
    const ytDlpCommand = [
      'yt-dlp',
      `"${url}"`,
      `--format "${formatOption}"`,
      '--merge-output-format mp4',
      '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"',
      '--no-check-certificates',
      '--no-cache-dir',
      '--progress',
      '--no-warnings',
      '--force-ipv4',
      '--geo-bypass',
      '--ignore-errors',
      '--no-playlist',
      '--add-metadata',
      '--retries 10',
      '--fragment-retries 10',
      '--file-access-retries 10',
      '--no-part',
      '--no-mtime',
      `--output "${outputPath}"`
    ].join(' ');

    console.log('Executing command:', ytDlpCommand);
    
    // Download video using yt-dlp command
    const { stdout, stderr } = await execPromise(ytDlpCommand);
    console.log('Download output:', stdout);
    
    if (stderr) {
      console.error('Download stderr:', stderr);
    }

    // Verify the file exists and has content
    if (!fs.existsSync(outputPath)) {
      throw new Error('Video download failed - file not created');
    }
    
    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      fs.unlinkSync(outputPath);
      throw new Error('Video download failed - empty file created');
    }

    // Try to get video title for the filename
    let fileName = `video-${Date.now()}.mp4`;
    try {
      const infoCommand = `yt-dlp --print "%(title)s" "${url}"`;
      const { stdout: videoTitle } = await execPromise(infoCommand);
      if (videoTitle && videoTitle.trim()) {
        const safeTitle = videoTitle.trim().replace(/[^a-zA-Z0-9]/g, '_');
        fileName = `${safeTitle}.mp4`;
      }
    } catch (err) {
      console.error('Error getting video title:', err);
      // Use default filename
    }

    // Set headers for file download
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.header('Content-Type', 'video/mp4');
    
    // Stream the video file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up the temporary file after streaming
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    });

    // Handle streaming errors
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to stream video',
          message: err.message
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message,
      details: 'Please try a different video or try again later'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 