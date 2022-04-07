from db.connection import Base, SessionLocal, engine
import db.crud_member_type as crud_member
import db.crud_isco_type as crud_isco
from seeder.static.static_member_isco import member_values, isco_values


# Start seeding

Base.metadata.create_all(bind=engine)
session = SessionLocal()

for m in member_values:
    member = crud_member.get_member_type_by_name(session=session, name=m)
    if not member:
        payload = {"name": m}
        member_type = crud_member.add_member_type(
            session=session, payload=payload)
print("Seeding Member Type Done")

for i in isco_values:
    isco = crud_isco.get_isco_type_by_name(session=session, name=i)
    if not isco:
        payload = {"name": i}
        isco_type = crud_isco.add_isco_type(
            session=session, payload=payload)
print("Seeding Isco Type Done")

session.close()
