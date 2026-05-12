import express from "express";
import axios from "axios";

const router = express.Router();

const TOPIC_SERVICE_URL =
  process.env.TOPIC_SERVICE_URL || "http://localhost:5000/analyze-topics";

router.get("/", async (_req, res) => {
  try {
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
          "Topic analytics service is offline. Start ai-service/app.py on port 5000."
      });
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Failed to fetch topic analytics";

    res.status(status).json({ error: message });
  }
});

export default router;
