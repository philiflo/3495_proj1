import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const pool = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await pool.query("INSERT INTO users (email, password_hash) VALUES (?,?)", [email, hash]);
    res.status(201).json({ id: r.insertId, email });
  } catch {
    res.status(409).json({ error: "email exists" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) return res.status(401).json({ error: "invalid" });
  const token = jwt.sign({ userId: u.id, email: u.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

app.get("/verify", (req, res) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });
  try { res.json(jwt.verify(token, process.env.JWT_SECRET)); }
  catch { res.status(401).json({ error: "invalid token" }); }
});

app.listen(3000, () => console.log("auth on 3000"));
