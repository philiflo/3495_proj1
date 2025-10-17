# 3495 Project 1 

A simple Dockerized Microservice System

- **Auth (Node/Express)** — register/login users, issue & verify JWTs  
- **Enter (Node/Express)** — submit numeric values (JWT required) → **MySQL**  
- **Analytics (Python/FastAPI)** — compute **min/max/avg/count** from MySQL → write to **MongoDB**  
- **Show (Node/Express)** — (JWT required) read stats from MongoDB and display

## Commands to run (run from repo root)

```bash
# Build & start everything
docker compose up -d --build
docker compose ps

# Open UIs
# Auth:     http://localhost:3000/
# Enter:    http://localhost:3001/
# Show:     http://localhost:3002/
# Analytics http://localhost:8000/docs

# Tail logs 
docker compose logs -f auth enter analytics show

# Stop everything 
docker compose down

