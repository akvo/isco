import os
import enum
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from bs4 import BeautifulSoup
from typing import List, Optional
from models.user import UserRecipient
from jinja2 import Environment, FileSystemLoader
from util.i18n import EmailText

webdomain = os.environ["WEBDOMAIN"]

loader = FileSystemLoader(".")
env = Environment(loader=loader)

html_template = env.get_template("./templates/main.html")


# Every setting has a default so development and test environments boot
# without a relay configured; only a deployment that actually sends mail
# has to supply them.
#
# The defaults describe the common correct relay: port 587 with STARTTLS.
# Implicit SSL is what port 465 wants instead, and neither mode can be
# inferred from the port number -- pick the wrong one and smtplib opens a
# plaintext socket against a TLS-only port and blocks until EMAIL_TIMEOUT.


def env_flag(name: str, default: Optional[str] = None) -> Optional[bool]:
    value = os.environ.get(name)
    if value is None or value.strip() == "":
        if default is None:
            return None
        return default.strip().lower() in ("1", "true", "yes")
    return value.strip().lower() in ("1", "true", "yes")


def get_smtp_config():
    host = os.environ.get("EMAIL_HOST", "localhost")
    port = int(os.environ.get("EMAIL_PORT", "587"))
    user = os.environ.get("EMAIL_HOST_USER", "")
    password = os.environ.get("EMAIL_HOST_PASSWORD", "")
    from_email = os.environ.get("EMAIL_FROM") or "noreply@cocoamonitoring.net"
    from_name = os.environ.get("EMAIL_FROM_NAME", "")

    explicit_ssl = env_flag("EMAIL_USE_SSL")
    explicit_tls = env_flag("EMAIL_USE_TLS")

    if explicit_ssl is not None:
        use_ssl = explicit_ssl
    else:
        use_ssl = port == 465

    if explicit_tls is not None:
        use_tls = explicit_tls
    else:
        use_tls = not use_ssl

    timeout = int(os.environ.get("EMAIL_TIMEOUT", "10"))
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "from_email": from_email,
        "from_name": from_name,
        "use_ssl": use_ssl,
        "use_tls": use_tls,
        "timeout": timeout,
    }


# Static module-level defaults for backward compatibility
EMAIL_HOST = os.environ.get("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = (
    env_flag("EMAIL_USE_TLS", "true")
    if env_flag("EMAIL_USE_TLS") is not None
    else (EMAIL_PORT != 465)
)
EMAIL_USE_SSL = (
    env_flag("EMAIL_USE_SSL", "false")
    if env_flag("EMAIL_USE_SSL") is not None
    else (EMAIL_PORT == 465)
)
EMAIL_TIMEOUT = 10


# Recipients arrive as {"Email", "Name"} dicts -- the shape
# models.user.User.recipient produces and every call site passes along. Here
# they only have to be rendered into an RFC 5322 address list.
def format_recipients(recipients: List[UserRecipient]) -> str:
    return ", ".join(formataddr((r["Name"], r["Email"])) for r in recipients)


def html_to_text(html):
    soup = BeautifulSoup(html, "lxml")
    body = soup.find("body")
    return "".join(body.get_text())


class MailTypeEnum(enum.Enum):
    register = "register"
    register_to_member = "register_to_member"
    invitation = "invitation"
    # inform_user = "inform_user"
    verify_email = "verify_email"
    reset_password = "reset_password"
    user_approved = "user_approved"
    data_download_requested = "data_download_requested"
    data_download_approved = "data_download_approved"
    ongoing_data_download_approved = "ongoing_data_download_approved"
    add_collaborator = "add_collaborator"
    notify_submission_completed_to_secretariat_admin = (
        "notify_submission_completed_to_secretariat_admin"
    )
    otp_code = "otp_code"
    feedback = "feedback"


class Email:
    def __init__(
        self,
        recipients: List[UserRecipient],
        type: MailTypeEnum,
        bcc: Optional[List[UserRecipient]] = None,
        context: Optional[str] = None,
        body: Optional[str] = None,
        body_translation: Optional[str] = None,
        button_url: Optional[str] = None,
        info: Optional[str] = None,
        signature: Optional[bool] = None,
    ):
        self.type = EmailText[type.value]
        self.recipients = recipients
        self.bcc = bcc
        self.context = context
        self.body = body
        self.body_translation = body_translation
        self.button_url = button_url
        self.info = info
        self.signature = signature

    @property
    def html(self) -> str:
        """Rendered body; separate from `data` for the /template/email
        preview, which wants the HTML without a message around it."""
        type = self.type.value
        body = type["body"]
        if self.body:
            body = self.body
        body_translation = type["body_translation"]
        if self.body_translation:
            body_translation = self.body_translation
        button = type["button"]
        if self.button_url:
            button = button.replace("#button_url#", self.button_url)
        return html_template.render(
            logo=f"{webdomain}/apple-touch-icon.png",
            instance_name="ISCO",
            webdomain=webdomain,
            title=type["title"],
            title_translation=type["title_translation"],
            body=body,
            body_translation=body_translation,
            image=type["image"],
            message=type["message"],
            context=self.context,
            button=button,
            info=type["info"],
            signature=type["signature"],
        )

    @property
    def data(self) -> EmailMessage:
        config = get_smtp_config()
        html = self.html
        msg = EmailMessage()
        if config["from_name"]:
            msg["From"] = formataddr(
                (config["from_name"], config["from_email"])
            )
        else:
            msg["From"] = config["from_email"]
        # A header may not contain a linefeed, and util.i18n wraps its
        # bilingual subjects across source lines.
        subject = " ".join(self.type.value["subject"].split())
        msg["Subject"] = f"ISCO {subject}"
        msg["To"] = format_recipients(self.recipients)
        if self.bcc:
            msg["Bcc"] = format_recipients(self.bcc)
        # The plain-text rendering is the message body and the HTML is
        # registered as an alternative, so a client that refuses HTML still
        # receives something readable. smtplib strips the Bcc header on send
        # while still using it for the envelope.
        msg.set_content(html_to_text(html))
        msg.add_alternative(html, subtype="html")
        return msg

    def send(self) -> bool:
        TESTING = os.environ.get("TESTING")
        if TESTING:
            return True
        config = get_smtp_config()
        try:
            cls = smtplib.SMTP_SSL if config["use_ssl"] else smtplib.SMTP
            with cls(
                config["host"], config["port"], timeout=config["timeout"]
            ) as relay:
                # STARTTLS upgrades a plaintext connection, so it is only
                # meaningful when the socket did not already start as SSL.
                if config["use_tls"] and not config["use_ssl"]:
                    relay.starttls()
                if config["user"]:
                    relay.login(config["user"], config["password"])
                relay.send_message(self.data)
            return True
        except Exception as e:
            print(
                f"[ERROR] Failed to send email via {config['host']}:"
                f"{config['port']} (SSL={config['use_ssl']}, "
                f"TLS={config['use_tls']}): {e}"
            )
            return False
