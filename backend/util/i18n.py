import os
import enum

from util.common import get_prev_year

webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"


current_year = get_prev_year(prev=0, year=True)


class EmailText(enum.Enum):
    register = {
        "title": "Registration",
        "title_translation": None,
        "subject": "Registration",
        "body": """
            #user_name# (#user_email#) from #organisation_name#
            has registered in the reporting tool. Now you can
            approve user in Manage User page.
            """,
        "message": None,
        "body_translation": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
    register_to_member = {
        "title": None,
        "title_translation": None,
        "subject": "Registration",
        "body": f"""
            Dear reporting member / partner,
            <p>
            #user_name# (#user_email#) from your organisation has signed up for
            the {current_year} Monitoring Round at cocoamonitoring.net
            </p>
            <p>
            If this is an invalid signup please get in touch with the reporting
            tool admins. Contact:
            </p>
            <ul>
                <li>
                    For Beyond Chocolate and DISCO:
                    Lisa Graepel (graepel@idhtrade.org)
                </li>
                <li>
                    For FRISCO: Kitty Grapperon (kgrapperon@deloitte.fr)
                </li>
                <li>
                    For GISCO: Ulrike Joras (ulrike.joras@giz.de)
                </li>
                <li>
                    For SWISSCO: Esther Waldmeier
                    (esther. waldmeier@kakaoplattform.ch)
                </li>
            </ul>
            """,
        "message": None,
        "body_translation": f"""
            Liebes Mitglied, ,
            <p>
            Herr/ Frau #user_name# (#user_email#) aus Ihrer Organisation hat
            sich für die Monitoring-Runde {current_year} auf cocoamonitoring.
            net registriert.
            </p>
            <p>
            Wenn dies eine ungültige Anmeldung ist, wenden Sie sich bitte an
            die Administratoren des Monitoringtools:
            </p>
            <ul>
                <li>
                    Für Beyond Chocolate und DISCO:
                    Lisa Graepel (graepel@idhtrade.org)
                </li>
                <li>
                    Für FRISCO: Kitty Grapperon (kgrapperon@deloitte.fr)
                </li>
                <li>
                    Für GISCO: Ulrike Joras (ulrike.joras@giz.de)
                </li>
                <li>
                    Für SWISSCO: Esther Waldmeier
                    (esther-waldmeier@kakaoplattform.ch)
                </li>
            </ul>
            """,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    invitation = {
        "title": None,
        "title_translation": None,
        "subject": "Invitation | Einladungsschreiben",
        "body": """<div>
                Dear reporting member,
                <p>
                Thank you for signing up to the online monitoring tool of
                Beyond Chocolate, DISCO, FRISCO, SWISSCO and GISCO. Your
                registration has been approved.
                Please click the following button to set your password and
                finalize your registration.
                </p>
                </div>""",
        "body_translation": """<div>
                Liebes  Mitglied,
                <p>
                vielen Dank, dass Sie sich für das Online-Monitoring-Tool von
                Beyond Chocolate, DISCO, FRISCO, SWISSCO und dem Forum
                Nachhaltiger Kakao  angemeldet haben. Ihre Registrierung wurde
                bestätigt.
                Bitte klicken Sie auf den untenstehenden Link, um Ihr Passwort
                festzulegen und Ihre Registrierung abzuschließen.
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": """<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Set password | Passwort festlegen
                        </button>
                    </a>""",
        "info": None,
        "signature": True,
    }
    verify_email = {
        "title": None,
        "title_translation": None,
        "subject": "Email Verification | E-Mail-Verifizierung",
        "body": """<div>
                    Dear reporting member,
                    <p>
                    Thank you for signing up to the online monitoring tool of
                    Beyond Chocolate, DISCO, FRISCO, SWISSCO and GISCO. Please
                    click the following button to verify your email address.
                    You will be notified  as soon as your account has
                    been approved.
                    </p>
                    </div>
                    """,
        "body_translation": """<div>
                    „Liebes Mitglied,
                    <p>
                    vielen Dank, dass Sie sich für das Online-Monitoringtool
                    von Beyond Chocolate, DISCO, FRISCO, SWISSCO und vom Forum
                    Nachhaltiger Kakao angemeldet haben. Bitte klicken Sie auf
                    untenstehenden Link, um Ihre E-Mail-Adresse zu
                    verifizieren.
                    Sie werden benachrichtigt, sobald Ihre Registrierung
                    genehmigt
                    wurde.
                    </p>
                    </div>""",
        "message": None,
        "image": None,
        "button": """<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-link block">
                            Verify Email | E-Mail-Verifizierung
                        </button>
                    </a>""",
        "info": None,
        "signature": True,
    }
    reset_password = {
        "title": None,
        "title_translation": None,
        "subject": "Password Reset | Passwort Zurücksetzen",
        "body": """<div>
                Dear reporting member,
                <p>
                You have submitted a password change request. If it wasn't you
                please disregard this email and make sure you can still login
                to your account. If it was you, then click the following
                button:
                </p>
                </div>""",
        "body_translation": """<div>
                Liebes  Mitglied,
                <p>
                Sie haben eine Passwortänderung angefordert. Falls Sie dies
                nicht waren, ignorieren Sie bitte diese E-Mail und stellen Sie
                sicher, dass Sie sich immer noch in Ihr Konto einloggen können.
                Wenn Sie ihr Passwort ändern möchten, klicken Sie auf die
                folgende Schaltfläche:
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": """<a href="#button_url#" target="_blank" rel="noreferrer">
                        <button class="btn btn-reset-password block">
                            Password Reset | Passwort Zurücksetzen
                        </button>
                    </a>""",
        "info": None,
        "signature": True,
    }
    user_approved = {
        "title": None,
        "title_translation": None,
        "subject": "User Signup approved | Benutzeranmeldung Genehmigt",
        "body": f"""<div>
                Dear reporting member,
                <p>
                Your password for the online monitoring tool of
                Beyond Chocolate, DISCO, FRISCO, SWISSCO and GISCO has been
                set and you will now be able to start reporting your
                {current_year} data.
                </p>
                <p>
                Once you have logged in, please click the “survey” tab at the
                top left of the screen. You will then be able to open a new
                questionnaire and start reporting on your {current_year} data.
                Please do not forget to save your questionnaire before you
                leave the tool so you can continue working on it at a later
                time.
                </p>
                <p>
                In case of questions and feedback, please contact:
                <ul>
                    <li>
                        For Beyond Chocolate and DISCO:
                        Lisa Graepel (graepel@idhtrade.org
                    </li>
                    <li>
                        For FRISCO: Kitty Grapperon
                        (kgrapperon@deloitte.fr)
                    </li>
                    <li>
                        For GISCO: Ulrike Joras (ulrike.joras@giz.de)
                    </li>
                    <li>
                        For SWISSCO: Esther Waldmeier
                        (esther.waldmeier@kakaoplattform.ch)
                    </li>
                </ul>
                </p>
                </div>""",
        "body_translation": f"""<div>
                Liebes  Mitglied,
                <p>
                Ihr Passwort für das Online-Monitoring-Tool von Beyond
                Chocolate, DISCO, FRISCO, SWISSCO und dem Forum Nachhaltiger
                Kakao wurde festgelegt und Sie können nun mit der
                Berichterstattung  Ihrer Daten aus dem Jahr {current_year}
                beginnen.
                </p>
                <p>
                Sobald Sie sich eingeloggt haben, klicken Sie bitte auf die
                Registerkarte "Umfrage" oben links auf dem Bildschirm. Sie
                können dann einen neuen Fragebogen öffnen und mit der
                Berichterstattung über Ihre Daten für {current_year} beginnen.
                Bitte vergessen Sie nicht, Ihren Fragebogen zu speichern,
                bevor Sie das Tool verlassen, damit Sie ihn zu einem späteren
                Zeitpunkt weiterbearbeiten können.
                </p>
                <p>
                Bei Fragen und Rückmeldungen wenden Sie sich bitte an:
                <ul>
                    <li>
                        Für Beyond Chocolate und DISCO:
                        Lisa Graepel (graepel @idhtrade.org)
                    </li>
                    <li>
                        Für FRISCO: Kitty Grapperon (kgrapperon@deloitte.fr)
                    </li>
                    <li>
                        Für GISCO: Ulrike Joras (ulrike.joras@giz.de)
                    </li>
                    <li>
                        Für SWISSCO: Esther Waldmeier
                        (esther.waldmeier @kakaoplattform.ch)
                    </li>
                </ul>
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    data_download_requested = {
        "title": None,
        "title_translation": None,
        "subject": """Data Download Request
                    | Anfrage zum Herunterladen von Daten""",
        "body": None,
        "body_translation": None,
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
    data_download_approved = {
        "title": None,
        "title_translation": None,
        "subject": """Data Download Approved
                    | Antrag auf Datendownload genehmigt""",
        "body": """<div>
                Dear reporting member,
                <p>
                Your request to download your reported data has been approved.
                You can now enter the tool and download the data.
                </p>
                <p>
                For security reasons, the approved data access will expire
                after 5 days. Then you will have to make a new request.
                </p>
                </div>""",
        "body_translation": """<div>
                Sehr geehrtes Mitglied,
                <p>
                Ihr Antrag zum Herunterladen Ihrer Daten wurde genehmigt. Sie
                können sich nun in das Online-Tool einloggen und Ihre Daten
                herunterladen.
                </p>
                <p>
                Aus Sicherheitsgründen endet der genehmigte Datenzugang nach
                einer Frist von 5 Tagen. Danach müssten Sie erneut eine Anfrage
                stellen.
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    ongoing_data_download_approved = {
        "title": None,
        "title_translation": None,
        "subject": """Data Download Approved
                    | Antrag auf Datendownload genehmigt""",
        "body": """<div>
                Dear reporting member,
                <p>
                Your request to download your data you have reported thus far
                has been approved. You can now enter the tool and download the
                data. Please note that if you make changes to your reporting,
                these are not automatically updated in the download. You will
                need to request another download to update these changes.
                </p>
                <p>
                For security reasons, the approved data access will expire
                after 5 days. Then you will have to make a new request.
                </p>
                </div>""",
        "body_translation": """<div>
                Sehr geehrtes Mitglied,
                <p>
                Ihr Antrag zum Herunterladen Ihrer bis zum jetzigen Zeitpunkt
                ausgefüllten Daten wurde genehmigt. Sie können sich nun in das
                Online-Tool einloggen und Ihre Daten herunterladen. Bitte
                beachten Sie, dass Veränderungen der Daten, die Sie jetzt
                vornehmen nicht automatisch im Download aktualisiert werden.
                Sie müssen einen weiteren Download anfordern, um diese
                Änderungen zu aktualisieren.
                </p>
                <p>
                Aus Sicherheitsgründen läuft der genehmigte Datenzugang nach 5
                Tagen ab. Dann müssen Sie einen neuen Antrag stellen.
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    add_collaborator = {
        "title": None,
        "title_translation": None,
        "subject": "Organisation added as collaborator",
        "body": """<div>
                Dear reporting member / partner,
                <p>
                #assigning_name# from #assigning_org_name# has added your
                organisation as a collaborator for a project.
                </p>
                <p>
                You can now view and edit data in the saved project in your
                \"previously saved forms\" section in the portal.
                </p>
                <p>Please contact us via the feedback form in case you face
                any issues.</p>
                </div>""",
        "body_translation": """<div>
                Sehr geehrte/r Teilnehmer/in,
                <p>
                #assigning_name# von #assigning_org_name# hat Ihre
                Organisation als Partner für ein Projekt registriert.
                </p>
                <p>
                Der gespeicherte Projekt-Fragebogen erscheint nun im
                Monitoringportal in Ihrem Menu \"Auswahl eines zuvor
                gespeicherten Fragebogens\" (oben links). Sie können Ihn
                ansehen und bearbeiten.
                </p>
                <p>
                Bitte kontaktieren Sie uns über das Feedback-Formular, falls
                Sie Schwierigkeiten haben.
                </p>
                </div>""",
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": True,
    }
    notify_submission_completed_to_secretariat_admin = {
        "title": "Submission Completed",
        "title_translation": None,
        "subject": "Submission Completed",
        "body": """
            #user_name# (#user_email#) from #organisation_name#
            successfully submitted data for #questionnaire_name#.
            """,
        "message": None,
        "body_translation": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
    otp_code = {
        "title": None,
        "title_translation": None,
        "subject": "OTP Code",
        "body": """<div>
            #user_name#, </br>
            Please enter this OTP to continue download:
            <h2>#OTP Code#</h2>
            <span>
            This code is valid for #expired time# minutes.
            </span>
            </div>""",
        "body_translation": """<div>
            #user_name#,</br>
            Bitte geben Sie dieses OTP ein,
            um mit dem Herunterladen fortzufahren:
            <h2>#OTP Code#</h2>
            <span>Dieser Code ist #expired time# Minuten lang gültig.</span>
            </div>""",
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
    feedback = {
        "title": None,
        "title_translation": None,
        "subject": "New Feedback",
        "body": """<div>
            Name: #user_name#</br>
            Organisation: #organisation_name#</br>
            Title: #Title#</br>
            Category: #Category#</br>
            Feedback: #Content#
            </div>""",
        "body_translation": None,
        "message": None,
        "image": None,
        "button": None,
        "info": None,
        "signature": False,
    }
