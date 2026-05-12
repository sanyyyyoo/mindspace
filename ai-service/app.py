import os
import json
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from supabase import Client, create_client

# -----------------------------
# Flask App Setup
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# Load .env files manually
# -----------------------------
def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()

        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


# Load env from:
# ai-service/.env
# backend/.env
load_env_file(Path(__file__).resolve().parent / ".env")
load_env_file(Path(__file__).resolve().parent.parent / "backend" / ".env")

# -----------------------------
# Environment Variables
# -----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_KEY")
)

JOURNAL_TABLE = os.getenv(
    "SUPABASE_JOURNAL_TABLE",
    "journal_analysis"
)
DEBUG_LOG_PATH = Path(__file__).resolve().parent.parent / "debug-8c9304.log"


def debug_log(run_id: str, hypothesis_id: str, location: str, message: str, data: dict) -> None:
    payload = {
        "sessionId": "8c9304",
        "runId": run_id,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
    }
    with DEBUG_LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload) + "\n")

# -----------------------------
# Supabase Client
# -----------------------------
def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
        )

    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    )

# -----------------------------
# Timestamp Parser
# -----------------------------
def parse_timestamp(value: str):

    if not value:
        return None

    try:
        return (
            datetime
            .fromisoformat(value.replace("Z", "+00:00"))
            .astimezone(timezone.utc)
        )

    except ValueError:
        return None

# -----------------------------
# BERTopic Processing
# -----------------------------
def extract_topics(documents: list[str], run_id: str):

    # Lazy imports (faster Flask startup)
    debug_log(run_id, "H1", "app.py:extract_topics:imports:start", "Importing BERTopic dependencies", {"documentCount": len(documents)})
    from bertopic import BERTopic
    from sentence_transformers import SentenceTransformer
    from umap import UMAP
    import torch
    debug_log(
        run_id,
        "H2",
        "app.py:extract_topics:torch_env",
        "Captured torch runtime environment",
        {
            "torchVersion": torch.__version__,
            "cudaAvailable": torch.cuda.is_available(),
            "mpsAvailable": bool(getattr(torch.backends, "mps", None) and torch.backends.mps.is_available()),
        },
    )

    # Embedding model
    try:
        debug_log(run_id, "H1", "app.py:extract_topics:model_load:start", "Loading SentenceTransformer", {"modelName": "all-MiniLM-L6-v2"})
        embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )
        debug_log(run_id, "H1", "app.py:extract_topics:model_load:success", "Loaded SentenceTransformer", {"device": str(embedding_model.device)})
    except Exception as exc:
        debug_log(
            run_id,
            "H1",
            "app.py:extract_topics:model_load:error",
            "SentenceTransformer load failed",
            {"errorType": type(exc).__name__, "errorMessage": str(exc), "tracebackTail": traceback.format_exc()[-600:]},
        )
        raise

    # BERTopic model
    unique_docs = len(set(documents))
    if unique_docs < 3:
        raise ValueError("Need at least 3 unique journal entries for BERTopic clustering.")
    if len(documents) < 15:
        # Small datasets are unstable with larger spectral dimensions.
        n_neighbors = 2
        n_components = 1
    else:
        n_neighbors = max(2, min(8, unique_docs - 1))
        n_components = max(2, min(5, unique_docs - 2))
    umap_model = UMAP(
        n_neighbors=n_neighbors,
        n_components=n_components,
        min_dist=0.0,
        metric="cosine",
        random_state=42,
    )
    debug_log(
        run_id,
        "H4",
        "app.py:extract_topics:umap_config",
        "Configured UMAP for current document size",
        {"nDocs": len(documents), "uniqueDocs": unique_docs, "nNeighbors": n_neighbors, "nComponents": n_components},
    )
    topic_model = BERTopic(
        embedding_model=embedding_model,
        umap_model=umap_model,
        verbose=False
    )

    # Fit model
    topics, _ = topic_model.fit_transform(documents)

    return topics, topic_model

# -----------------------------
# Aggregate Topic Statistics
# -----------------------------
def aggregate_topic_stats(
    rows: list[dict],
    topic_assignments: list[int],
    topic_model: Any
):

    now_utc = datetime.now(timezone.utc)

    week_cutoff = now_utc - pd.Timedelta(days=7)
    month_cutoff = now_utc - pd.Timedelta(days=30)

    summary_by_topic = {}

    for row, topic_id in zip(rows, topic_assignments):

        # Ignore outlier topic
        if topic_id == -1:
            continue

        # Create topic bucket
        if topic_id not in summary_by_topic:

            words_with_scores = (
                topic_model.get_topic(topic_id) or []
            )

            keywords = [
                word
                for word, _score in words_with_scores[:5]
            ]

            summary_by_topic[topic_id] = {
                "topicId": topic_id,
                "keywords": keywords,
                "count": 0,
                "trend": {
                    "thisWeek": 0,
                    "thisMonth": 0
                }
            }

        # Increment total count
        summary_by_topic[topic_id]["count"] += 1

        # Time-based trends
        created_at = parse_timestamp(
            row.get("created_at")
        )

        if created_at:

            if created_at >= week_cutoff:
                summary_by_topic[topic_id]["trend"]["thisWeek"] += 1

            if created_at >= month_cutoff:
                summary_by_topic[topic_id]["trend"]["thisMonth"] += 1

    # Sort topics by popularity
    topics = sorted(
        summary_by_topic.values(),
        key=lambda item: item["count"],
        reverse=True
    )

    # Overall trends
    trends = {
        "thisWeek": sum(
            item["trend"]["thisWeek"]
            for item in topics
        ),
        "thisMonth": sum(
            item["trend"]["thisMonth"]
            for item in topics
        )
    }

    return topics, trends

# -----------------------------
# Health Route
# -----------------------------
@app.get("/")
def home():
    return jsonify({
        "status": "BERTopic service running"
    })

@app.get("/health")
def health():
    return jsonify({
        "status": "ok"
    })

# -----------------------------
# Topic Analysis Route
# -----------------------------
@app.post("/analyze-topics")
def analyze_topics():
    run_id = f"topic-{int(datetime.now(timezone.utc).timestamp() * 1000)}"

    try:
        debug_log(run_id, "H3", "app.py:analyze_topics:start", "Started topic analysis request", {})

        print("BERTopic analysis started")

        # Connect Supabase
        supabase = get_supabase_client()

        # Fetch journals
        response = (
            supabase
            .table(JOURNAL_TABLE)
            .select("id,journal,created_at")
            .order("created_at", desc=False)
            .execute()
        )

        rows = response.data or []

        print(f"Journals fetched: {len(rows)}")

        # Extract valid documents
        documents = [
            row.get("journal", "").strip()
            for row in rows
            if row.get("journal", "").strip()
        ]
        unique_documents = len(set(documents))

        # Need minimum docs
        if len(documents) < 2:

            return jsonify({
                "topics": [],
                "trends": {
                    "thisWeek": 0,
                    "thisMonth": 0
                },
                "message":
                    "Need at least 2 journal entries for BERTopic clustering.",
                "totalJournals": len(documents)
            })
        if len(documents) < 10:
            return jsonify({
                "topics": [],
                "trends": {
                    "thisWeek": 0,
                    "thisMonth": 0
                },
                "message":
                    "Need at least 10 journal entries for stable BERTopic clustering.",
                "totalJournals": len(documents)
            })
        if unique_documents < 3:
            return jsonify({
                "topics": [],
                "trends": {
                    "thisWeek": 0,
                    "thisMonth": 0
                },
                "message":
                    "Need at least 3 unique journal entries for BERTopic clustering.",
                "totalJournals": len(documents)
            })

        # Keep only valid rows
        filtered_rows = [
            row
            for row in rows
            if row.get("journal", "").strip()
        ]

        print("Running BERTopic...")

        # Run BERTopic
        topic_assignments, topic_model = extract_topics(
            documents
            , run_id
        )

        # Aggregate stats
        topics, trends = aggregate_topic_stats(
            filtered_rows,
            topic_assignments,
            topic_model
        )

        print(f"Topics generated: {len(topics)}")

        return jsonify({
            "topics": topics,
            "trends": trends,
            "totalJournals": len(documents)
        })

    except Exception as exc:
        debug_log(
            run_id,
            "H3",
            "app.py:analyze_topics:error",
            "Analyze topics failed",
            {"errorType": type(exc).__name__, "errorMessage": str(exc)},
        )

        print("BERTopic Error:", str(exc))

        return jsonify({
            "error": str(exc)
        }), 500

# -----------------------------
# Start Server
# -----------------------------
if __name__ == "__main__":

    print("Starting BERTopic AI Service...")
    print("Running on http://127.0.0.1:5000")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )