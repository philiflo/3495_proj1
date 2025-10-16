# 3495 Project 1 — Option 1 (Microservices, Minimal GUI)

A super-simple, Dockerized microservices system that fulfills the assignment:

- **Auth (Node/Express)** — register/login users, issue & verify JWTs  
- **Enter (Node/Express)** — submit numeric values (JWT required) → **MySQL**  
- **Analytics (Python/FastAPI)** — compute **min/max/avg/count** from MySQL → write to **MongoDB**  
- **Show (Node/Express)** — (JWT required) read stats from MongoDB and display

Each Node service serves a tiny GUI at `/`. Analytics provides Swagger at `/docs`.  
Everything runs with **Docker Compose** — no local Node/Python setup needed.

---

## 🔧 Commands Cheat Sheet (run from repo root)

```bash
# Build & start everything
docker compose up -d --build
docker compose ps

# Open UIs
# Auth:     http://localhost:3000/
# Enter:    http://localhost:3001/
# Show:     http://localhost:3002/
# Analytics http://localhost:8000/docs

# Tail logs (Ctrl+C to stop)
docker compose logs -f auth enter analytics show

# Stop everything (preserves DB data due to volumes)
docker compose down

# Hard reset data (DANGEROUS: wipes DBs)
docker compose down
rm -rf mysql/data mongo/data
docker compose up -d --build

