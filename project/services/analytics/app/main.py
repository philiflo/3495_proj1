import os, datetime
from fastapi import FastAPI
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from pymongo import MongoClient

load_dotenv()
app = FastAPI()

mysql_uri = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DATABASE')}"
engine = create_engine(mysql_uri, pool_pre_ping=True)

mongo = MongoClient(os.getenv("MONGO_URI"))
mdb = mongo[os.getenv("MONGO_DB")]
stats_col = mdb["statistics"]

@app.post("/recompute")
def recompute():
    with engine.connect() as conn:
        row = conn.execute(text("""
            SELECT MIN(value) AS minv, MAX(value) AS maxv, AVG(value) AS avgv, COUNT(*) AS cnt
            FROM entries
        """)).mappings().first()
    stats = {
        "_id": "global",
        "min": float(row["minv"]) if row["minv"] is not None else None,
        "max": float(row["maxv"]) if row["maxv"] is not None else None,
        "avg": float(row["avgv"]) if row["avgv"] is not None else None,
        "count": int(row["cnt"]),
        "computed_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    stats_col.replace_one({"_id": "global"}, stats, upsert=True)
    return {"ok": True, "stats": stats}
