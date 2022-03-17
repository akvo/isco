from db.truncator import truncate
from db.connection import Base, SessionLocal, engine
import db.crud_member_type as crud_member
import db.crud_isco_type as crud_isco
from seeder.static.static_member_isco import member_values, isco_values


# Start seeding

Base.metadata.create_all(bind=engine)
session = SessionLocal()

action_member = truncate(session=session, table="member_type")
print(action_member)
for m in member_values:
    payload = {"name": m}
    member_type = crud_member.add_member_type(session=session,
                                              payload=payload)
print("Seeding Member Type Done")

action_isco = truncate(session=session, table="isco_type")
print(action_isco)
for i in isco_values:
    payload = {"name": i}
    isco_type = crud_isco.add_isco_type(session=session,
                                        payload=payload)
print("Seeding Isco Type Done")

session.close()
