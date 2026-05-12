import { useEffect, useState } from "react";
import { getMindspaceApiBaseUrl } from "../../lib/mindspaceApi.js";

function TopicDashboard() {
  const [topics, setTopics] = useState([]);
  const [trends, setTrends] = useState({ thisWeek: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTopics = async () => {
    setLoading(true);
    setError("");

    try {
      const base = getMindspaceApiBaseUrl();
      if (!base) {
        throw new Error(
          "API URL is not configured (set VITE_API_URL to your Render backend URL)."
        );
      }
      const response = await fetch(`${base}/topics`);
      const rawText = await response.text();
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Expected JSON from /topics but got ${contentType || "unknown content type"}. Start/restart backend and python topic service.`
        );
      }

      const data = JSON.parse(rawText);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load topic analytics");
      }

      setTopics(data.topics || []);
      setTrends(data.trends || { thisWeek: 0, thisMonth: 0 });
      setMessage(data.message || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white">Topic Dashboard</h2>
        <button
          onClick={fetchTopics}
          className="px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-400 transition"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Topics"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Topic Mentions (This Week)</p>
          <p className="text-2xl text-green-400 font-bold">{trends.thisWeek}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Topic Mentions (Last 30 Days)</p>
          <p className="text-2xl text-cyan-400 font-bold">{trends.thisMonth}</p>
        </div>
      </div>

      {loading && <p className="text-gray-300">Loading topic analytics...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {message && !loading && !error && (
        <p className="text-yellow-300 mb-4">{message}</p>
      )}

      {!loading && !error && topics.length === 0 && !message && (
        <p className="text-gray-300">No historical topic clusters yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.topicId}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">Topic #{topic.topicId}</p>
              <span className="text-sm text-indigo-300">
                Count: {topic.count}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {(topic.keywords || []).map((keyword) => (
                <span
                  key={`${topic.topicId}-${keyword}`}
                  className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              <p>Week: {topic.trend?.thisWeek ?? 0}</p>
              <p>Month: {topic.trend?.thisMonth ?? 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopicDashboard;
