import os
import enum

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


class EmailText(enum.Enum):
    invitation = {
        "title": "Invitation",
        "subject": "Invitation",
        "body": "Link",
        "message": None,
        "image": None
    }
