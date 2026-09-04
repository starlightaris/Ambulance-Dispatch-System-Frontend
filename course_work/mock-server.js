import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

let counter = 1;
let queue = [];

function computeCategoryAndScore(assessment) {
  // naive scoring for mock purposes
  const score = Math.max(0, 100 - assessment.age - (assessment.painScore || 0) * 2 + (assessment.breathing ? 0 : 50));
  const category = score > 75 ? 'RED' : score > 60 ? 'ORANGE' : score > 45 ? 'YELLOW' : score > 30 ? 'GREEN' : 'BLUE';
  return { category, score: Number((score / 10).toFixed(1)) };
}

app.post('/api/v1/triage/assessments', (req, res) => {
  const data = req.body;
  if (!data || !data.patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  const { category, score } = computeCategoryAndScore(data);
  const item = {
    id: String(counter++),
    patientId: data.patientId,
    category,
    score,
    queuePosition: queue.length + 1,
    timestamp: new Date().toISOString()
  };

  queue.push(item);

  return res.status(201).json(item);
});

app.get('/api/v1/triage/assessments/queue', (req, res) => {
  res.json(queue.slice().sort((a, b) => a.queuePosition - b.queuePosition));
});

app.put('/api/v1/triage/assessments/:id/resolve', (req, res) => {
  const { id } = req.params;
  const idx = queue.findIndex((q) => q.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  queue.splice(idx, 1);
  // recompute positions
  queue = queue.map((item, i) => ({ ...item, queuePosition: i + 1 }));
  return res.sendStatus(204);
});

const port = 5175;
app.listen(port, () => {
  console.log(`Mock triage server listening on http://localhost:${port}`);
});
