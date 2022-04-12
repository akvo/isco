# Seeder for real data
import os
import json
import inquirer
from .util import cascade_seeder
from db.connection import Base, SessionLocal, engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

source_folder = "./seeder/static/"
file_list = list(filter(lambda x: ".json" in x, os.listdir(source_folder)))
file_list = [
    inquirer.List('target', message="Select File", choices=file_list),
]
source_file = inquirer.prompt(file_list)
target = source_file["target"]

data = json.load(open(f"{source_folder}{target}"))

Base.metadata.create_all(bind=engine)
session = SessionLocal()

cascade_seeder(session=session, data=data)
print(f"Seeding {target} done")

session.close()
