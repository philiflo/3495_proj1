import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

dotenv.config();
const app = express();
app.use(express.json());

const pool = await mysql.createPool({
  host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?,?)', [email, hash]);
    res.status(201).json({ id: r.insertId, email });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email exists' });
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

app.get('/verify', async (req, res) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userId: payload.userId, email: payload.email });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

app.listen(process.env.PORT, () => console.log(`auth on ${process.env.PORT}`));
