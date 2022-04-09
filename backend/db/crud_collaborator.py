from typing import List
from sqlalchemy.orm import Session
from models.collaborator import Collaborator
from models.collaborator import CollaboratorDict, CollaboratorPayload


def add_collaborator(session: Session,
                     data: int,
                     payload: List[CollaboratorPayload]) -> CollaboratorDict:
    collaborators = [
        Collaborator(id=None,
                     data=data,
                     organisation=p['organisation']) for p in payload]
    session.bulk_save_objects(collaborators)
    session.commit()
    session.flush()
    session.refresh(collaborators)
    return collaborators


def get_collaborator_by_organisation(session: Session,
                                     organisation: int
                                     ) -> List[CollaboratorDict]:
    collaborator = session.query(
        Collaborator).filter(Collaborator.organisation == organisation).all()
    return collaborator


def get_collaborator_by_data(session: Session,
                             data: int
                             ) -> List[CollaboratorDict]:
    collaborator = session.query(
        Collaborator).filter(Collaborator.data == data).all()
    return collaborator


def delete_collaborator_by_data(session: Session, data: int):
    session.query(Collaborator).filter(
        Collaborator.data == data).delete()
    session.commit()


def delete_collaborator_by_ids(session: Session, ids: List[int]):
    session.query(Collaborator).filter(
        Collaborator.id.in_(ids)).delete(synchronize_session='fetch')
    session.commit()
