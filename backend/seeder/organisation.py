import os
import json
from db.truncator import truncate
from db.connection import Base, SessionLocal, engine
from db import crud_organisation, crud_member_type


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_file = "./source/organisation.json"

f = open(source_file)
data = json.load(f)

action_truncate = truncate(session=session, table="organisation")
print(action_truncate)

for d in data:
    if d['member'] == "All":
        member = crud_member_type.get_member_type_by_name(
            session=session, name=d['member'])
        if member:
            payload = {
                "code": None,
                "name": d['name'],
                "active": d['active'],
                "member_type": [member.id],
                "isco_type": [1]
            }
            org = crud_organisation.add_organisation(
                session=session, payload=payload)
            print(f"Seed {org.name} done")

print("Seeding Organisations done")
