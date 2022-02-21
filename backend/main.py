import uvicorn
from db.connection import engine, Base
from core.config import app

Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
