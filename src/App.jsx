import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (platform === 'youtube') {
        // For YouTube, trigger direct download
        window.location.href = `/api/youtube?url=${encodeURIComponent(url)}`;
        setLoading(false);
      } else {
        // For other platforms, use the existing API response format
        const response = await axios.get(`/api/${platform}?url=${encodeURIComponent(url)}`);
        if (response.data.success && response.data.downloadLink) {
          window.open(response.data.downloadLink, '_blank');
        } else {
          setError('Failed to get download link');
        }
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(`${err.response.data.error}: ${err.response.data.message}\n${err.response.data.details || ''}`);
      } else {
        setError('An error occurred while processing your request. Please try again later.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Social Media Video Downloader
      </h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select Platform
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Video URL
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste video URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg whitespace-pre-line">
            {error}
          </div>
        )}

        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Download'}
        </button>
      </div>
    </div>
  );
}

export default App; 