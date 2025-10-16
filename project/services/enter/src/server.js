import express from "express";
import dotenv from "dotenv";
import axios from "axios";
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

async function verify(req, res, next) {
  try {
    const token = req.headers.authorization || "";
    const { data } = await axios.get(`${process.env.AUTH_URL}/verify`, {
      headers: { Authorization: token },
    });
    req.user = data;
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}

app.post("/entries", verify, async (req, res) => {
  const { value } = req.body || {};
  if (value == null || isNaN(Number(value))) return res.status(400).json({ error: "numeric value required" });
  const [r] = await pool.query("INSERT INTO entries (user_id, value) VALUES (?,?)", [req.user.userId, Number(value)]);
  res.status(201).json({ id: r.insertId, user_id: req.user.userId, value: Number(value) });
});

app.listen(3001, () => console.log("enter on 3001"));
