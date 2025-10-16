import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());

// serve / from public/index.html
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// mongo connection
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const statsCol = client.db(process.env.MONGO_DB).collection("statistics");

// GET /stats (JWT required)
app.get("/stats", async (req, res) => {
  try {
    const token = req.headers.authorization || "";
    await axios.get(`${process.env.AUTH_URL}/verify`, {
      headers: { Authorization: token },
    });
    const doc = await statsCol.findOne({ _id: "global" });
    res.json(doc || { message: "no stats yet" });
  } catch (e) {
    res.status(401).json({ error: "unauthorized or no stats" });
  }
});

// POST /recompute (convenience proxy to analytics)
app.post("/recompute", async (_req, res) => {
  try {
    const { data } = await axios.post(`${process.env.ANALYTICS_URL}/recompute`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "recompute failed" });
  }
});

app.listen(3002, () => console.log("show on 3002"));
