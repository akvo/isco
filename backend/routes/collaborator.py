from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_collaborator as crud
import db.crud_organisation as crud_org
from db.connection import get_session
from models.collaborator import CollaboratorDict, CollaboratorPayload
from models.user import User
from middleware import verify_user
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
collaborator_route = APIRouter()


def send_collaborator_email(session, user, recipient_org_ids):
    assigning_name = user.name
    assigning_org = crud_org.get_organisation_by_id(
        session=session, id=user.organisation).name
    recipients = session.query(User).filter(
        User.organisation.in_(recipient_org_ids)).all()
    if recipients:
        body = f'''<div>
                Dear reporting member / partner,
                <p>
                {assigning_name} from {assigning_org} has added your
                organisation as a collaborator for a project.
                </p>
                <p>
                You can now view and data to the saved project in your
                \"previously saved forms\" section in the portal.
                </p>
                <p>
                Please contact us via the feedback form in case you face any
                issues.
                </p>
                </div>'''
        body_translation = f'''<div>
                Sehr geehrte/r Teilnehmer/in,
                <p>
                {assigning_name} von {assigning_org} hat Ihre
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
                </div>'''
        email = Email(
            recipients=[r.recipient for r in recipients],
            type=MailTypeEnum.add_collaborator,
            body=body,
            body_translation=body_translation)
        return email.send
    return False


@collaborator_route.post("/collaborator/{data:path}",
                         response_model=List[CollaboratorDict],
                         summary="add new collaborator",
                         name="collaborator:create",
                         tags=["Collaborator"])
def add(req: Request, data: int, payload: List[CollaboratorPayload],
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    collaborators = []
    org_ids = []
    for p in payload:
        collaborator = crud.add_collaborator(
            session=session, data=data, payload=p)
        collaborators.append(collaborator)
        org_ids.append(collaborator.organisation)
    send_collaborator_email(
        session=session, user=user, recipient_org_ids=org_ids)
    return [c.serialize for c in collaborators]


@collaborator_route.put("/collaborator/{data:path}",
                        response_model=List[CollaboratorDict],
                        summary="update member type",
                        name="collaborator:put",
                        tags=["Collaborator"])
def update(req: Request, data: int, payload: List[CollaboratorPayload],
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    # get collaborator by data as current collaborator
    current_collabs = crud.get_collaborator_by_data(session=session, data=data)
    current_collabs = [c.serialize for c in current_collabs]
    # to add
    org_ids = []
    for p in payload:
        if not any(p['organisation'] == current['organisation']
                   for current in current_collabs):
            crud.add_collaborator(
                session=session, data=data, payload=p)
        org_ids.append(p['organisation'])
    # to delete
    to_delete = []
    for current in current_collabs:
        if not any(current['organisation'] == p['organisation']
                   for p in payload):
            to_delete.append(current['id'])
    crud.delete_collaborator_by_ids(session=session, ids=to_delete)
    # get all collaborator by data id
    collaborators = crud.get_collaborator_by_data(session=session, data=data)
    # send email
    send_collaborator_email(
        session=session, user=user, recipient_org_ids=org_ids)
    return [c.serialize for c in collaborators]


@collaborator_route.get("/collaborator/{data:path}",
                        response_model=List[CollaboratorDict],
                        summary="get collaborator by data id",
                        name="collaborator:get_by_data_id",
                        tags=["Collaborator"])
def get_by_data_id(req: Request, data: int,
                   session: Session = Depends(get_session),
                   credentials: credentials = Depends(security)):
    collaborators = crud.get_collaborator_by_data(session=session, data=data)
    return [c.serialize for c in collaborators]
