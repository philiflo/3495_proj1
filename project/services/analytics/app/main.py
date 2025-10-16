import os, datetime
from fastapi import FastAPI
from dotenv import load_dotenv
import pymysql
from pymongo import MongoClient

load_dotenv()
app = FastAPI()

def mysql_conn():
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        cursorclass=pymysql.cursors.DictCursor,
    )

mongo = MongoClient(os.getenv("MONGO_URI"))
mdb = mongo[os.getenv("MONGO_DB")]
stats_col = mdb["statistics"]

@app.post("/recompute")
def recompute():
    with mysql_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT MIN(value) AS minv, MAX(value) AS maxv, AVG(value) AS avgv, COUNT(*) AS cnt FROM entries")
            row = cur.fetchone() or {"minv": None, "maxv": None, "avgv": None, "cnt": 0}
    stats = {
        "_id": "global",
        "min": float(row["minv"]) if row["minv"] is not None else None,
        "max": float(row["maxv"]) if row["maxv"] is not None else None,
        "avg": float(row["avgv"]) if row["avgv"] is not None else None,
        "count": int(row["cnt"]),
        "computed_at": datetime.datetime.utcnow().isoformat() + "Z",
    }
    stats_col.replace_one({"_id": "global"}, stats, upsert=True)
    return {"ok": True, "stats": stats}
