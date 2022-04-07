from db.connection import Base, SessionLocal, engine
from db.crud_cascade import add_cascade, get_cascade_by_name
from seeder.static.static_cascade import cascade_values
from seeder.static.static_nested import nested_values


# Start seeding
Base.metadata.create_all(bind=engine)
session = SessionLocal()

cascade = get_cascade_by_name(session=session,
                              name=cascade_values['name'],
                              ctype=cascade_values['type'])
if not cascade:
    cascade = add_cascade(session=session, payload=cascade_values)
print("Seeding Cascade Done")


nested_list = get_cascade_by_name(session=session,
                                  name=nested_values['name'],
                                  ctype=nested_values['type'])
if not nested_list:
    nested_list = add_cascade(session=session, payload=nested_values)
print("Seeding Nested List Done")
