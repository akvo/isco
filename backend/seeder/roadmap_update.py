import os
from db.connection import Base, SessionLocal, engine
from seeder import util_roadmap


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()


# update
util_roadmap.roadmap_form_seeder(session=session)
