import os
from bs4 import BeautifulSoup
import enum
from typing import List, Optional
from models.user import UserRecipient
from mailjet_rest import Client
from jinja2 import Environment, FileSystemLoader
import base64
from util.i18n import EmailText

mjkey = os.environ['MAILJET_APIKEY']
mjsecret = os.environ['MAILJET_SECRET']
webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"

mailjet = Client(auth=(mjkey, mjsecret))
loader = FileSystemLoader('.')
env = Environment(loader=loader)

html_template = env.get_template("./templates/main.html")
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
ftype += ';base64'


def send(data):
    res = mailjet.send.create(data=data)
    res = res.json()
    return res


def generate_icon(icon: str, color: Optional[str] = None):
    svg_path = f"./templates/icons/{icon}.svg"
    try:
        open(svg_path)
    except (OSError, IOError):
        return None
    soup = BeautifulSoup(open(svg_path, "r"), "lxml")
    if color:
        for spath in soup.findAll("path"):
            spath['style'] = f"fill: {color};"
    return soup


def html_to_text(html):
    soup = BeautifulSoup(html, "lxml")
    body = soup.find('body')
    return "".join(body.get_text())


def format_attachment(file):
    try:
        open(file, "r")
    except (OSError, IOError) as e:
        print(e)
        return None
    return {
        "ContentType": ftype,
        "Filename": file.split("/")[2],
        "content": base64.b64encode(open(file, "rb").read()).decode('UTF-8')
    }


class MailTypeEnum(enum.Enum):
    register = "register"
    invitation = "invitation"
    inform_user = "inform_user"


class Email:
    def __init__(self,
                 recipients: List[UserRecipient],
                 type: MailTypeEnum,
                 bcc: Optional[List[UserRecipient]] = None,
                 attachment: Optional[str] = None,
                 context: Optional[str] = None,
                 body: Optional[str] = None):
        self.type = EmailText[type.value]
        self.recipients = recipients
        self.bcc = bcc
        self.attachment = attachment
        self.context = context
        self.body = body

    @property
    def data(self):
        type = self.type.value
        body = type["body"]
        if self.body:
            body = self.body
        # instance name based on env
        html = html_template.render(logo=f"{webdomain}/apple-touch-icon.png",
                                    instance_name="ISCO",
                                    webdomain=webdomain,
                                    title=type["title"],
                                    body=body,
                                    image=type["image"],
                                    message=type["message"],
                                    context=self.context)
        payload = {
            "FromEmail": "noreply@akvo.org",
            "Subject": f"ISCO {type['subject']}",
            "Html-part": html,
            "Text-part": html_to_text(html),
            "Recipients": self.recipients,
        }
        if self.bcc:
            payload.update({"Bcc": self.bcc})
        if self.attachment:
            attachment = format_attachment(self.attachment)
            payload.update({"Attachments": [attachment]})
        return payload

    @property
    def send(self) -> int:
        TESTING = os.environ.get("TESTING")
        if TESTING:
            return True
        res = mailjet.send.create(data=self.data)
        return res.status_code == 200
