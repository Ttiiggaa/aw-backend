// aw-backend – Attention Wallet demo backend (Railway-ready)

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware -------------------------------------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json({ limit: "1mb" }));

// --- In-memory session store (demo only!) ------------------------
const sessions = new Map();

function createSessionId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 10)
  );
}

// Simple scoring based on number & diversity of events
function computeAttentionScore(session) {
  if (!session || !session.events || session.events.length === 0) {
    return {
      attentionScore: "N/A",
      attentionLabel: "UNKNOWN"
    };
  }

  const events = session.events;
  const uniqueNames = new Set(events.map((e) => e.eventName));

  // Base score on how many key events we saw
  let score = 40 + uniqueNames.size * 10;
  if (events.length > 5) score += 10;
  if (events.length > 10) score += 10;

  if (score > 100) score = 100;

  let label = "MEDIUM";
  if (score < 60) label = "LOW";
  else if (score >= 80) label = "HIGH";

  return {
    attentionScore: score,
    attentionLabel: label
  };
}

// --- Routes ------------------------------------------------------

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true, message: "aw-backend is running" });
});

// Init session
app.post("/api/v1/sessions/init", (req, res) => {
  const sessionId = createSessionId();
  const now = new Date().toISOString();

  const meta = {
    sessionId,
    createdAt: now,
    userId: req.body?.userId ?? "demo-user",
    deviceId: req.body?.deviceId ?? "demo-device",
    events: []
  };

  sessions.set(sessionId, meta);

  console.log("[AW] init session", sessionId);
  res.json({ sessionId });
});

// Receive event
app.post("/api/v1/sessions/event", (req, res) => {
  const { sessionId, eventName, payload } = req.body || {};

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ message: "Invalid or unknown sessionId" });
  }

  if (!eventName) {
    return res.status(400).json({ message: "eventName is required" });
  }

  const s = sessions.get(sessionId);
  s.events.push({
    eventName,
    payload: payload || {},
    ts: new Date().toISOString()
  });

  console.log("[AW] event", sessionId, eventName);
  res.json({ ok: true });
});

// Complete session + compute score
app.post("/api/v1/sessions/complete", (req, res) => {
  const { sessionId } = req.body || {};

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ message: "Invalid or unknown sessionId" });
  }

  const session = sessions.get(sessionId);
  const result = computeAttentionScore(session);

  const response = {
    sessionId,
    ...result,
    country: "UNKNOWN"
  };

  console.log("[AW] complete", sessionId, response);
  res.json(response);
});

// Fallback 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
    error: "Not Found",
    statusCode: 404
  });
});

app.listen(PORT, () => {
  console.log(`[AW] Backend listening on port ${PORT}`);
});
