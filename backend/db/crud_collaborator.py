from typing import List
from sqlalchemy.orm import Session
from models.collaborator import Collaborator
from models.collaborator import CollaboratorDict, CollaboratorPayload


def add_collaborator(session: Session,
                     data: int,
                     payload: CollaboratorPayload) -> CollaboratorDict:
    collaborator = Collaborator(id=None,
                                data=data,
                                organisation=payload["organisation"])
    session.add(collaborator)
    session.commit()
    session.flush()
    session.refresh(collaborator)
    return collaborator


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


# comment for now
# def delete_collaborator_by_data(session: Session, data: int):
#     session.query(Collaborator).filter(
#         Collaborator.data == data).delete()
#     session.commit()


def delete_collaborator_by_ids(session: Session, ids: List[int]):
    session.query(Collaborator).filter(
        Collaborator.id.in_(ids)).delete(synchronize_session='fetch')
    session.commit()
