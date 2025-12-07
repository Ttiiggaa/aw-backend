const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PORT aus Railway verwenden (Pflicht!)
const PORT = process.env.PORT || 8080;

// SESSION MEMORY
let sessions = {};

// INIT SESSION
app.post('/api/v1/sessions/init', (req, res) => {
  const { userId, deviceId } = req.body;

  const sessionId = Math.random().toString(36).substring(2, 12);

  sessions[sessionId] = {
    userId,
    deviceId,
    events: [],
    started: Date.now()
  };

  console.log("[AM] init session", sessionId);

  res.json({ sessionId });
});

// RECEIVE EVENT
app.post('/api/v1/sessions/event', (req, res) => {
  const { sessionId, eventName, payload } = req.body;

  if (!sessions[sessionId]) {
    return res.status(400).json({ error: "Invalid sessionId" });
  }

  sessions[sessionId].events.push({
    name: eventName,
    payload,
    time: Date.now()
  });

  res.json({ ok: true });
});

// COMPLETE SESSION
app.post('/api/v1/sessions/complete', (req, res) => {
  const { sessionId } = req.body;

  if (!sessions[sessionId]) {
    return res.status(400).json({ error: "Invalid sessionId" });
  }

  const session = sessions[sessionId];

  const score = session.events.length * 10;

  res.json({
    sessionId,
    attentionScore: score,
    attentionLabel: score > 30 ? 'HIGH' : 'LOW',
  });
});

// ROOT
app.get('/', (req, res) => {
  res.send("Attention Wallet Backend running.");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`[AM] Backend listening on port ${PORT}`);
});
