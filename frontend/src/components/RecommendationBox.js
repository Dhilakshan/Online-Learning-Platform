import { useState } from 'react';
import axios from 'axios';

export default function RecommendationBox() {
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setRecommendation('');
    try {
      const { data } = await axios.post(
        'http://localhost:5001/api/recommend',
        { prompt },
        token
          ? { headers: { Authorization: `Bearer ${token}` } } // ✅ Fixed this line
          : undefined
      );
      setRecommendation(data.recommendation);
    } catch (error) {
      console.error(error);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 8px #eee", maxWidth: 600, margin: "2rem auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Get Course Recommendations</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label htmlFor="recommend-prompt" style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
            What are your learning goals?
          </label>
          <input
            id="recommend-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I want to be a software engineer, what courses should I follow?"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: "#22c55e",
            color: "white",
            padding: "10px 0",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? 'Getting recommendations...' : 'Get Recommendations'}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {recommendation && (
        <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 8 }}>
          <h3 style={{ fontWeight: 500, marginBottom: 8 }}>Recommended Courses:</h3>
          <p style={{ whiteSpace: "pre-line" }}>{recommendation}</p>
        </div>
      )}
    </div>
  );
}
