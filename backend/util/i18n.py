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
        "button": None,
        "info": None,
        "signature": False,
    }
    invitation = {
        "title": "Invitation",
        "subject": "Invitation",
        "body": '''<div>
                Dear reporting member,
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO. Your registration has been
                approved. Please click following button to set your password
                and finalize your registration.
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Set password
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    verify_email = {
        "title": "Email Verification",
        "subject": "Email Verification",
        "body": '''<div>
                Dear reporting member,
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO. Please click following
                button to verify your email address. As a next step, the admin
                within your organisation/company will need to approve your
                registration. You will be notified when as soon as your
                account has been approved.
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-link block">
                            Verify Email
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    reset_password = {
        "title": "Reset Password",
        "subject": "Reset Password",
        "body": '''<div>
                Dear reporting member,
                <p>
                You have submitted a password change request. If it wasn't you
                please disregard this email and make sure you can still login
                to your account.
                If it was you, then click the following button:
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Click to change password
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    user_approved = {
        "title": "Approved",
        "subject": "Approved",
        "body": '''<div>
                Dear reporting member,
                <p>
                Your password for the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO has been set and you will
                now be able to start reporting on your 2021 data.
                </p>
                <p>
                Once you have logged in, please click the “survey” tab at the
                top left of the screen. You will then be able to open a new
                questionnaire and start reporting on your 2021 data. Please do
                not forget to save your questionnaire before you leave the
                tool so you can continue working on it at a later time.
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": None,
        "info": '''<div>
                In case of questions and feedback, please contact:
                <ul>
                    <li>For Beyond Chocolate:
                    Marloes Humbeeck (humbeeck@idhtrade.org)</li>
                    <li>For DISCO:
                    Mark de Waard (dewaard@idhtrade.org)</li>
                    <li>For GISCO: Julia Jawtusch (julia.jawtusch@giz.de)</li>
                </ul>
                </div>''',
        "signature": True,
    }
