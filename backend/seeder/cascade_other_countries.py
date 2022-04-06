# Seeder for real data
import os
import json
import db.crud_cascade as crud
from db.connection import Base, SessionLocal, engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
files = [
    "cascade_other_countries.json"
]

for f in files:
    source_file = f"./seeder/static/{f}"
    data = json.load(open(source_file))
    # seed cascade
    cascade_payload = {
        "name": data["name"],
        "type": data["type"],
        "cascades": None
    }
    cascade = crud.add_cascade(session=session,
                               payload=cascade_payload)
    for d in data["cascades"]:
        clist_payload = {
            "cascade": cascade.id,
            "parent": None,
            "code": None,
            "name": d["name"],
            "path": None,
            "level": d["level"]
        }
        clist = crud.add_cascade_list(session=session,
                                      payload=clist_payload)
        for c in d["childrens"]:
            child_payload = {
                "cascade": cascade.id,
                "parent": clist.id,
                "code": None,
                "name": c["name"],
                "path": f"{clist.id}.",
                "level": c["level"]
            }
            child = crud.add_cascade_list(session=session,
                                          payload=child_payload)
    print(f"Seeding {f} done")
