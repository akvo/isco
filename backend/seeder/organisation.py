import os
import json
from db.connection import Base, SessionLocal, engine
from db import crud_organisation, crud_member_type, crud_isco_type
from models.organisation import Organisation


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_file = "./source/organisation.json"

f = open(source_file)
data = json.load(f)

for d in data:
    members = []
    for m in d['member']:
        member = crud_member_type.get_member_type_by_name(
            session=session, name=m)
        members.append(member.id)
    iscos = []
    for i in d['isco']:
        isco = crud_isco_type.get_isco_type_by_name(
            session=session, name=i)
        iscos.append(isco.id)
    # check if organisation already on db by name
    organisation = session.query(Organisation).filter(
        Organisation.name == d['name']).first()
    payload = {
        "code": None,
        "name": d['name'],
        "active": d['active'],
        "member_type": members,
        "isco_type": iscos
    }
    if not organisation:
        org = crud_organisation.add_organisation(session=session,
                                                    payload=payload)
    if organisation:
        org = crud_organisation.update_organisation(session=session,
                                                    id=organisation.id,
                                                    payload=payload)
    print(f"Seed {org.name} done")

print("Seeding Organisations done")
