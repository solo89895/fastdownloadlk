import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'video.mp4'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1>FastDownloadLK</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">Video URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="Enter video URL"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Downloading...' : 'Download Video'}
          </button>
        </form>
        {error && <div className="error">Error: {error}</div>}
      </div>
    </div>
  )
}

export default App 