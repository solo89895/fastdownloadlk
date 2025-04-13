import React, { useState } from 'react';

const DownloadSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDownloadLink(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      const data = await response.json();
      setDownloadLink(data.download_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter video URL..."
            required
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Downloading...' : 'Download'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
          {error}
        </div>
      )}

      {downloadLink && (
        <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded">
          <p className="text-green-200 mb-2">Video ready for download!</p>
          <a
            href={downloadLink}
            download
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Click here to download
          </a>
        </div>
      )}
    </div>
  );
};

export default DownloadSection; 