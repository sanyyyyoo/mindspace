import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { mindspacePost } from "../../lib/mindspaceApi.js";

function JournalInput() {
  const [journal, setJournal] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!journal.trim()) return;

    setLoading(true);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user?.id) {
        window.location.assign("/login");
        return;
      }

      const { data } = await mindspacePost("/analyze", {
        journal,
        user_id: user.id,
      });

      setResult({
        ...data,
        categories: Array.isArray(data?.categories) ? data.categories : [],
      });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        window.location.assign("/login");
        return;
      }
      console.error("Error analyzing journal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "60vh",
      }}
    >
      <div
        className="selfcast-card"
        style={{
          width: "100%",
          maxWidth: 640,
          padding: "1.5rem",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow), var(--glow)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: "0 0 1rem",
          }}
        >
          Daily Journal
        </h2>

        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="Tell me about your day..."
          style={{
            width: "100%",
            minHeight: 160,
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            resize: "vertical",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!journal || loading}
          className="selfcast-pill selfcast-pill--active"
          style={{
            marginTop: "1rem",
            padding: "0.55rem 1.25rem",
            fontSize: "0.95rem",
            opacity: !journal || loading ? 0.5 : 1,
            cursor: !journal || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing…" : "Analyze Day"}
        </button>

        {result && (
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.1rem",
                color: "var(--accent-primary)",
                margin: "0 0 0.75rem",
              }}
            >
              Productivity Score: {result.productivityScore}/10
            </p>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {result.summary}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              {(Array.isArray(result.categories) ? result.categories : []).map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "color-mix(in srgb, var(--accent-primary) 22%, transparent)",
                    color: "var(--text-accent)",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            <p
              style={{
                fontStyle: "italic",
                color: "var(--text-muted)",
                marginTop: "0.75rem",
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              {result.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JournalInput;
