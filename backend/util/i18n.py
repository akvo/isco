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
        "title": "Invitation<br/><i>Einladungsschreiben</i>",
        "subject": "Invitation | Einladungsschreiben",
        "body": '''<div>
                Dear reporting member, <br/>
                <i>Sehr geehrtes meldendes Mitglied,</i>
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO. Your registration has been
                approved. Please click following button to set your password
                and finalize your registration.
                </p>
                <p>
                <i>vielen Dank, dass Sie sich für das Online-Monitoring-Tool
                von Beyond Chocolate, DISCO und GISCO angemeldet haben. Ihre
                Registrierung wurde bestätigt. Bitte klicken Sie auf den
                untenstehenden Link, um Ihr Passwort festzulegen und Ihre
                Registrierung abzuschließen.</i>
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Set password | <i>Passwort festlegen</i>
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    verify_email = {
        "title": "Email Verification<br/><i>E-Mail-Verifizierung</i>",
        "subject": "Email Verification | E-Mail-Verifizierung",
        "body": '''<div>
                Dear reporting member, <br/>
                <i>Sehr geehrtes meldendes Mitglied,</i>
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO. Please click following
                button to verify your email address. As a next step, the admin
                within your organisation/company will need to approve your
                registration. You will be notified when as soon as your
                account has been approved.
                </p>
                <p>
                <i>vielen Dank, dass Sie sich für das Online-Überwachungstool
                von Beyond Chocolate, DISCO und GISCO angemeldet haben. Bitte
                klicken Sie auf den untenstehenden Link, um Ihre
                E-Mail-Adresse zu verifizieren. Im nächsten Schritt muss der
                Administrator Ihrer Organisation/Ihres Unternehmens Ihre
                Registrierung bestätigen. Sie werden benachrichtigt, sobald
                Ihr Konto genehmigt wurde.</i>
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": '''<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-link block">
                            Verify Email | <i>E-Mail-Verifizierung</i>
                        </button>
                    </a>''',
        "info": None,
        "signature": True,
    }
    reset_password = {
        "title": "Password Reset<br/><i>Passwort zurücksetzen</i>",
        "subject": "Password Reset | Passwort zurücksetzen",
        "body": '''<div>
                Dear reporting member, <br/>
                <i>Sehr geehrtes meldendes Mitglied,</i>
                <p>
                You have submitted a password change request. If it wasn't you
                please disregard this email and make sure you can still login
                to your account.
                If it was you, then click the following button:
                </p>
                <p>
                <i>Sie haben eine Passwortänderung angefordert. Falls Sie dies
                nicht waren, ignorieren Sie bitte diese E-Mail und stellen Sie
                sicher, dass Sie sich immer noch in Ihr Konto einloggen können.
                Wenn Sie ihr Passwort ändern möchten, klicken Sie auf die
                folgende Schaltfläche:</i>
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
        "title": "User Signup Approved<br/><i>Benutzeranmeldung Genehmigt</i>",
        "subject": "User Signup approved | Benutzeranmeldung Genehmigt",
        "body": '''<div>
                Dear reporting member, <br/>
                <i>Sehr geehrtes meldendes Mitglied,</i>,
                <p>
                Your password for the online monitoring tool of
                Beyond Chocolate, DISCO and GISCO has been set and you will
                now be able to start reporting on your 2021 data.
                </p>
                <p>
                <i>Ihr Passwort für das Online-Monitoring-Tool von Beyond
                Chocolate, DISCO und GISCO wurde festgelegt und Sie können nun
                mit der Berichterstattung über Ihre Daten
                aus dem Jahr 2021 beginnen.</i>
                </p>
                <p>
                Once you have logged in, please click the “survey” tab at the
                top left of the screen. You will then be able to open a new
                questionnaire and start reporting on your 2021 data. Please do
                not forget to save your questionnaire before you leave the
                tool so you can continue working on it at a later time.
                </p>
                <p>
                <i>Sobald Sie sich eingeloggt haben, klicken Sie bitte auf die
                Registerkarte "Umfrage" oben links auf dem Bildschirm. Sie
                können dann einen neuen Fragebogen öffnen und mit der
                Berichterstattung über Ihre Daten für 2021 beginnen. Bitte
                vergessen Sie nicht, Ihren Fragebogen zu speichern, bevor Sie
                das Tool verlassen, damit Sie ihn zu einem späteren Zeitpunkt
                weiterbearbeiten können.</i>
                </p>
                </div>''',
        "message": None,
        "image": None,
        "button": None,
        "info": '''<div>
                In case of questions and feedback, please contact:<br/>
                <i>Bei Fragen und Rückmeldungen wenden Sie sich bitte an:</i>
                <ul>
                    <li>
                    For Beyond Chocolate - <i>Für Beyond Chocolate</i> :<br/>
                    Marloes Humbeeck (humbeeck@idhtrade.org)</li>
                    <li>For DISCO - <i>Für DISCO</i> :<br/>
                    Mark de Waard (dewaard@idhtrade.org)</li>
                    <li>For GISCO - <i>Für GISCO</i> :<br/>
                    Julia Jawtusch (julia.jawtusch@giz.de)</li>
                </ul>
                </div>''',
        "signature": True,
    }
