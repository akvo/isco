import os
import sys
from main import app
from fastapi.testclient import TestClient
from middleware import create_access_token
from middleware import decode_token
import util.survey_config as config

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

client = TestClient(app)


class Acc:
    def __init__(self, email, token):
        self.email = email if email else "support@akvo.org"
        self.data = {"email": self.email}
        self.token = token if token else create_access_token(
            data=self.data)
        self.decoded = decode_token(self.token)


def test_read_main():
    response = client.get("/")
    assert response.json() == "OK"
    assert response.status_code == 200


def test_read_credentials():
    if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
        service_account = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
        credentials = os.path.exists(service_account)
        assert credentials is True
    else:
        print("SKIPPING READ CREDENTIAL TEST")
        assert True is True


def test_survey_config():
    assert config.MEMBER_SURVEY
    assert config.PROJECT_SURVEY
    assert config.LIMITED_SURVEY
    assert config.MEMBER_SURVEY_UNLIMITED_MEMBER
    assert config.MEMBER_SURVEY_UNLIMITED_ISCO
    assert 7 in config.MEMBER_SURVEY
    assert 8 in config.PROJECT_SURVEY
    assert 13 in config.LIMITED_SURVEY
    assert 3 in config.MEMBER_SURVEY_UNLIMITED_ISCO
