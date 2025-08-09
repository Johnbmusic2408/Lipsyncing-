// src/App.jsx
import React, { useState } from 'react';

export default function App() {
  const [audio, setAudio] = useState(null);
  const [video, setVideo] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!audio || !video) {
      alert('Please select both audio and video/image files.');
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append('audio', audio);
    form.append('video', video);

    try {
      const res = await fetch('/api/merge', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (e) {
      alert('Error merging files: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
      <h1>LipSync Demo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Audio (mp3, wav):</label>
          <input type="file" accept="audio/*" onChange={e => setAudio(e.target.files[0])} />
        </div>
        <div>
          <label>Video/Image (mp4, jpg, png):</label>
          <input type="file" accept="video/*,image/*" onChange={e => setVideo(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Merging...' : 'Merge & Download'}
        </button>
      </form>
      {resultUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Result:</h3>
          <video src={resultUrl} controls width="100%" />
          <a href={resultUrl} download="merged.mp4" style={{ display: 'block', marginTop: 10 }}>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
