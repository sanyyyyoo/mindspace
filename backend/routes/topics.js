import express from "express";
import axios from "axios";

const router = express.Router();

const TOPIC_SERVICE_URL = (process.env.TOPIC_SERVICE_URL || "").trim();

router.get("/", async (_req, res) => {
  try {
    if (!TOPIC_SERVICE_URL) {
      return res.json({
        topics: [],
        trends: { thisWeek: 0, thisMonth: 0 },
        totalJournals: 0,
        message:
          "Topic analytics service URL is not configured (set TOPIC_SERVICE_URL on the server).",
      });
    }

    const { data } = await axios.post(
      TOPIC_SERVICE_URL,
      {},
      {
        timeout: 60000
      }
    );

    res.json(data);
  } catch (error) {
    const isServiceUnavailable =
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      !error.response;

    if (isServiceUnavailable) {
      return res.json({
        topics: [],
        trends: { thisWeek: 0, thisMonth: 0 },
        totalJournals: 0,
        message:
          "Topic analytics service is unreachable. Configure TOPIC_SERVICE_URL or start the topic worker.",
      });
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Failed to fetch topic analytics";

    res.status(status).json({ error: message });
  }
});

export default router;
