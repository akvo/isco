import pytest
import os
import util.storage as storage
from sqlalchemy.orm import Session
from db.crud_form import generate_webform_json_file


class TestStorage():
    @pytest.mark.asyncio
    async def test_upload_file_to_bucket(self, session: Session) -> None:
        if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
            json_file = generate_webform_json_file(session=session, id=1)
            uploaded_file = storage.upload(json_file, "test")
            assert storage.check(uploaded_file) is True
        else:
            print("SKIPPING STORAGE UPLOAD TEST")
            assert True is True

    @pytest.mark.asyncio
    async def test_list_file_in_bucket(self, session: Session) -> None:
        if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
            assert len(storage.get_files("test/")) > 1
        else:
            print("SKIPPING STORAGE UPLOAD TEST")
            assert True is True

    @pytest.mark.asyncio
    async def test_delete_file_from_bucket(self, session: Session) -> None:
        if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
            json_file = generate_webform_json_file(session=session, id=1)
            uploaded_file = storage.upload(json_file, "test")
            storage.delete(url=uploaded_file)
            assert storage.check(uploaded_file) is False
        else:
            print("SKIPPING STORAGE DELETE TEST")
            assert True is True
