import os
import json
from db.connection import Base, SessionLocal, engine
from db import crud_user
from models.user import UserRole, UserBase
from middleware import get_password_hash
from pydantic import SecretStr

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_file = "./source/user.json"

f = open(source_file)
data = json.load(f)

for d in data:
    user = crud_user.get_user_by_email(session=session, email=d['email'])
    if user is None:
        password = SecretStr(get_password_hash(d['password']))
        payload = UserBase(name=d['name'],
                           email=d['email'],
                           phone_number=d.get('phone_number'),
                           password=password,
                           role=UserRole.secretariat_admin.value,
                           organisation=d['organisation_id'])
        user = crud_user.add_user(session=session,
                                  payload=payload,
                                  invitation=True)
        user = crud_user.verify_user_email(session=session, email=user.email)
        print(f"Seed {user.name} done")

print("Seeding Users done")
