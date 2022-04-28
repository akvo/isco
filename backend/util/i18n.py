import os
import enum

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


class EmailText(enum.Enum):
    register = {
        "title": "Registration",
        "title_translation": None,
        "subject": "Registration",
        "body": None,
        "message": None,
        "body_translation": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
    register_to_member = {
        "title": "Registration",
        "title_translation": None,
        "subject": "Registration",
        "body": None,
        "message": None,
        "body_translation": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    invitation = {
        "title": None,
        "title_translation": None,
        "subject": "Invitation | Einladungsschreiben",
        "body": '''<div>
                Dear reporting member,
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO. Your registration has been
                approved. Please click following button to set your password
                and finalize your registration.
                </p>
                </div>''',
        "body_translation": '''<div>
                Sehr geehrtes meldendes Mitglied,
                <p>
                vielen Dank, dass Sie sich für das Online-Monitoring-Tool
                von Beyond Chocolate, DISCO und GISCO angemeldet haben. Ihre
                Registrierung wurde bestätigt. Bitte klicken Sie auf den
                untenstehenden Link, um Ihr Passwort festzulegen und Ihre
                Registrierung abzuschließen.
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Set password | Passwort festlegen
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    verify_email = {
        "title": None,
        "title_translation": None,
        "subject": "Email Verification | E-Mail-Verifizierung",
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
        "body_translation": '''<div>
                Sehr geehrtes meldendes Mitglied,
                <p>
                vielen Dank, dass Sie sich für das Online-Überwachungstool
                von Beyond Chocolate, DISCO und GISCO angemeldet haben. Bitte
                klicken Sie auf den untenstehenden Link, um Ihre
                E-Mail-Adresse zu verifizieren. Im nächsten Schritt muss der
                Administrator Ihrer Organisation/Ihres Unternehmens Ihre
                Registrierung bestätigen. Sie werden benachrichtigt, sobald
                Ihr Konto genehmigt wurde.
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-link block">
                            Verify Email | E-Mail-Verifizierung
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    reset_password = {
        "title": None,
        "title_translation": None,
        "subject": "Password Reset | Passwort Zurücksetzen",
        "body": '''<div>
                Dear reporting member,
                <p>
                You have submitted a password change request. If it wasn't you
                please disregard this email and make sure you can still login
                to your account. If it was you, then click the following
                button:
                </p>
                </div>''',
        "body_translation": '''<div>
                Sehr geehrtes meldendes Mitglied,
                <p>
                Sie haben eine Passwortänderung angefordert. Falls Sie dies
                nicht waren, ignorieren Sie bitte diese E-Mail und stellen Sie
                sicher, dass Sie sich immer noch in Ihr Konto einloggen können.
                Wenn Sie ihr Passwort ändern möchten, klicken Sie auf die
                folgende Schaltfläche:
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Password Reset | Passwort Zurücksetzen
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    user_approved = {
        "title": None,
        "title_translation": None,
        "subject": "User Signup approved | Benutzeranmeldung Genehmigt",
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
                <p>
                In case of questions and feedback, please contact:
                <ul>
                    <li>
                    For Beyond Chocolate:
                    Marloes Humbeeck (humbeeck@idhtrade.org)</li>
                    <li>For DISCO:
                    Mark de Waard (dewaard@idhtrade.org)</li>
                    <li>For GISCO:
                    Julia Jawtusch (julia.jawtusch@giz.de)</li>
                </ul>
                </p>
                </div>''',
        "body_translation": '''<div>
                Sehr geehrtes meldendes Mitglied,
                <p>
                Ihr Passwort für das Online-Monitoring-Tool von Beyond
                Chocolate, DISCO und GISCO wurde festgelegt und Sie können nun
                mit der Berichterstattung über Ihre Daten
                aus dem Jahr 2021 beginnen.
                </p>
                <p>
                Sobald Sie sich eingeloggt haben, klicken Sie bitte auf die
                Registerkarte "Umfrage" oben links auf dem Bildschirm. Sie
                können dann einen neuen Fragebogen öffnen und mit der
                Berichterstattung über Ihre Daten für 2021 beginnen. Bitte
                vergessen Sie nicht, Ihren Fragebogen zu speichern, bevor Sie
                das Tool verlassen, damit Sie ihn zu einem späteren Zeitpunkt
                weiterbearbeiten können.
                </p>
                <p>
                </p>
                Bei Fragen und Rückmeldungen wenden Sie sich bitte an:
                <ul>
                    <li>
                    Für Beyond Chocolate:
                    Marloes Humbeeck (humbeeck@idhtrade.org)</li>
                    <li>Für DISCO:
                    Mark de Waard (dewaard@idhtrade.org)</li>
                    <li>Für GISCO:
                    Julia Jawtusch (julia.jawtusch@giz.de)</li>
                </ul>
                </div>''',
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
