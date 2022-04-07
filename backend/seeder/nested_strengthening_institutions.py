# Seeder for real data
import os
import json
from .util import cascade_seeder
from db.connection import Base, SessionLocal, engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

filename = "nested_strengthening_institutions.json"
source_file = f"./seeder/static/{filename}"
data = json.load(open(source_file))

cascade_seeder(session=session, data=data)
print(f"Seeding {filename} done")

session.close()
