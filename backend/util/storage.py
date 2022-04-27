import os
import shutil
from pathlib import Path
from google.cloud import storage

BUCKET_NAME = "isco-storage"
BUCKET_FOLDER = os.environ['BUCKET_FOLDER']


def create_bucket_object(return_tuple: bool = False):
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    if return_tuple:
        return storage_client, bucket
    return bucket


def upload(file: str,
           folder: str,
           filename: str = None,
           public: bool = False,
           remove: bool = True):
    if not filename:
        filename = file.split("/")[-1]
    # testing environment
    TESTING = os.environ.get("TESTING")
    if TESTING:
        fake_storage = f"./tmp/fake-storage/{filename}"
        shutil.copy2(file, fake_storage)
        os.remove(file)
        return fake_storage
    # upload to gcloud
    bucket = create_bucket_object()
    destination_blob_name = f"{BUCKET_FOLDER}/{folder}/{filename}"
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file)
    if remove:
        os.remove(file)
    if public:
        blob.make_public()
        return blob.public_url
    return blob.name


def download(url: str):
    # testing environment
    TESTING = os.environ.get("TESTING")
    if TESTING:
        return url
    # download from gcloud
    bucket = create_bucket_object()
    blob = bucket.blob(url)
    tmp_file = url.split("/")[-1]
    tmp_file = f"./tmp/{tmp_file}"
    blob.download_to_filename(tmp_file)
    return tmp_file


def delete(url: str):
    filename = url.split("/")[-1]
    folder = url.split("/")[-2]
    # testing environent
    TESTING = os.environ.get("TESTING")
    if TESTING:
        os.remove(url)
        return url
    # delete from gcloud
    bucket = create_bucket_object()
    blob = bucket.blob(f"{BUCKET_FOLDER}/{folder}/{filename}")
    blob.delete()
    return blob.name


def check(url: str):
    # testing environent
    TESTING = os.environ.get("TESTING")
    if TESTING:
        path = Path(url)
        return path.is_file()
    storage_client, bucket = create_bucket_object(return_tuple=True)
    return storage.Blob(bucket=bucket, name=url).exists(storage_client)
