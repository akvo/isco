from db.truncator import truncate
from db.connection import Base, SessionLocal, engine
from db.crud_cascade import add_cascade
from seeder.static.static_cascade import cascade_values


# Start seeding
Base.metadata.create_all(bind=engine)
session = SessionLocal()

action_truncate = truncate(session=session, table="cascade")
print(action_truncate)
action_truncate = truncate(session=session, table="cascade_list")
print(action_truncate)
cascade = add_cascade(session=session, payload=cascade_values)
print("Seeding Cascade Done")
