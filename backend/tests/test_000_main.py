import os
import sys
from main import app
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.json() == "OK"
    assert response.status_code == 200
