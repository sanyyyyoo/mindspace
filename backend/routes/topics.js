import express from "express";
import axios from "axios";

const router = express.Router();

const TOPIC_SERVICE_URL =
  process.env.TOPIC_SERVICE_URL || "http://localhost:5000/analyze-topics";

router.get("/", async (_req, res) => {
  try {
    // #region agent log
    fetch("http://127.0.0.1:7810/ingest/4f7e815c-e347-4c56-9ea3-92fbb77274d7",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"8c9304"},body:JSON.stringify({sessionId:"8c9304",runId:"pre-fix",hypothesisId:"H4",location:"backend/routes/topics.js:GET/entry",message:"Topics route entered",data:{target:TOPIC_SERVICE_URL},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const { data } = await axios.post(
      TOPIC_SERVICE_URL,
      {},
      {
        timeout: 60000
      }
    );
    // #region agent log
    fetch("http://127.0.0.1:7810/ingest/4f7e815c-e347-4c56-9ea3-92fbb77274d7",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"8c9304"},body:JSON.stringify({sessionId:"8c9304",runId:"pre-fix",hypothesisId:"H4",location:"backend/routes/topics.js:GET/success",message:"Topics route returning service data",data:{hasTopics:Array.isArray(data?.topics),topicCount:Array.isArray(data?.topics)?data.topics.length:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    res.json(data);
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7810/ingest/4f7e815c-e347-4c56-9ea3-92fbb77274d7",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"8c9304"},body:JSON.stringify({sessionId:"8c9304",runId:"pre-fix",hypothesisId:"H4",location:"backend/routes/topics.js:GET/catch",message:"Topics route failed",data:{status:error.response?.status || null,errorMessage:error.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
