# 3495 Project 1 — Option 1 (Microservices)
## Run
docker compose up -d --build
## Smoke
# Register
curl -X POST http://localhost:3000/register -H 'Content-Type: application/json' -d '{"email":"me@example.com","password":"secret"}'
# Login (no jq)
TOKEN=$(curl -s -X POST http://localhost:3000/login -H 'Content-Type: application/json' -d '{"email":"me@example.com","password":"secret"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
# Insert & View
curl -X POST http://localhost:3001/entries -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"value": 42}'
curl -X POST http://localhost:8000/recompute
curl http://localhost:3002/stats -H "Authorization: Bearer $TOKEN"
