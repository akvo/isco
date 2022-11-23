import os
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate
from seeder.util_roadmap import roadmap_form_seeder


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
TESTING = os.environ.get("TESTING")

# truncate
if not TESTING:
    for table in [
        "roadmap_question_group", "roadmap_question", "roadmap_option",
        "roadmap_data", "roadmap_answer"
    ]:
        action = truncate(session=session, table=table)
        print(action)
    print("---------------------------")

# seed
roadmap_form_seeder(session=session)
