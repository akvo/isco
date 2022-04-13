import os
import enum

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


class EmailText(enum.Enum):
    invitation = {
        "title": "Invitation",
        "subject": "Invitation",
        "body": None,
        "message": None,
        "image": None
    }
