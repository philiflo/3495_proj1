import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import mysql from 'mysql2/promise';

dotenv.config();
const app = express();
app.use(express.json());

const pool = await mysql.createPool({
  host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE
});

async function verify(req, res, next) {
  const token = req.headers.authorization || '';
  try {
    await axios.get(`${process.env.AUTH_URL}/verify`, { headers: { Authorization: token }});
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

app.post('/entries', verify, async (req, res) => {
  const token = req.headers.authorization;
  const { data: user } = await axios.get(`${process.env.AUTH_URL}/verify`, { headers: { Authorization: token }});
  const { value } = req.body || {};
  if (value == null) return res.status(400).json({ error: 'value required' });
  const [r] = await pool.query('INSERT INTO entries (user_id, value) VALUES (?,?)', [user.userId, value]);
  res.status(201).json({ id: r.insertId, user_id: user.userId, value });
});

app.listen(process.env.PORT, () => console.log(`enter on ${process.env.PORT}`));
