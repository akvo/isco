import os
import enum

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


class EmailText(enum.Enum):
    register = {
        "title": "Registration",
        "subject": "Registration",
        "body": None,
        "message": None,
        "image": None
    }
    invitation = {
        "title": "Invitation",
        "subject": "Invitation",
        "body": None,
        "message": None,
        "image": None
    }
    verify_email = {
        "title": "Email Verification",
        "subject": "Email Verification",
        "body": None,
        "message": None,
        "image": None
    }
