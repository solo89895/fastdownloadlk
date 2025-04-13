import React from 'react';
import DownloadSection from './components/DownloadSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">FastDownloadLK</h1>
          <p className="text-center text-gray-400 mt-2">Download videos from YouTube, Facebook, Instagram, and TikTok</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <DownloadSection />
      </main>

      <footer className="py-6 px-4 bg-gray-800 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 FastDownloadLK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App; 