import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { MongoClient } from 'mongodb';

dotenv.config();
const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const statsCol = client.db(process.env.MONGO_DB).collection('statistics');

async function verify(req, res, next) {
  const token = req.headers.authorization || '';
  try {
    await axios.get(`${process.env.AUTH_URL}/verify`, { headers: { Authorization: token }});
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

app.get('/stats', verify, async (req, res) => {
  // Optionally refresh analytics each time:
  try { await axios.post(`${process.env.ANALYTICS_URL}/recompute`); } catch {}
  const doc = await statsCol.findOne({ _id: 'global' });
  res.json(doc || { message: 'no stats yet' });
});

app.listen(process.env.PORT, () => console.log(`show on ${process.env.PORT}`));
