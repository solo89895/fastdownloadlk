import { useState } from 'react'
import './App.css'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaDownload } from 'react-icons/fa'

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
    <div>
      <header className="header">
        <a href="/" className="logo">
          <FaDownload /> FastDownload<span>LK</span>
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#legal">Legal</a>
        </nav>
      </header>

      <main className="main-content">
        <h1 className="title">Download Videos from<br />Social Media Platforms</h1>
        <p className="subtitle">Fast, free, and secure video downloads in HD quality</p>

        <form onSubmit={handleSubmit} className="download-form">
          <div className="input-group">
            <input
              type="url"
              className="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="Paste your video URL here..."
            />
            <button type="submit" className="download-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Download'}
            </button>
          </div>
        </form>

        {error && <div className="error">Error: {error}</div>}

        <p className="terms">
          By using our service you accept our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
        </p>
        <a href="#how-to" className="how-to">Learn how to download videos →</a>

        <div className="social-icons">
          <a href="#facebook" className="social-icon facebook">
            <FaFacebook />
            <span>Facebook</span>
          </a>
          <a href="#instagram" className="social-icon instagram">
            <FaInstagram />
            <span>Instagram</span>
          </a>
          <a href="#youtube" className="social-icon youtube">
            <FaYoutube />
            <span>YouTube</span>
          </a>
          <a href="#tiktok" className="social-icon tiktok">
            <FaTiktok />
            <span>TikTok</span>
          </a>
        </div>
      </main>
    </div>
  )
}

export default App 