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
        "image": None,
        "button": None
    }
    invitation = {
        "title": "Invitation",
        "subject": "Invitation",
        "body": '''You have been added to the tool  for reporting on 2021 data.
                Please click the following button to set password:''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Set password
                        </button>
                    </a>''',
        "info": "Some guidance  around  basic usage of the tool"
    }
    verify_email = {
        "title": "Email Verification",
        "subject": "Email Verification",
        "body": None,
        "message": None,
        "image": None,
        "button": None
    }
    reset_password = {
        "title": "Reset Password",
        "subject": "Reset Password",
        "body": '''You have submitted a password change request.
                If it wasn't you please disregard this email and
                make sure you can still login to your account.
                 If it was you, then click the following button: ''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Click to change password
                        </button>
                    </a>'''
    }
