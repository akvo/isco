from sqlalchemy.orm import Session


def truncate(session: Session, table: str):
    session.execute(f"TRUNCATE TABLE {table} CASCADE;")
    session.execute(f"ALTER SEQUENCE {table}_id_seq RESTART WITH 1;")
    session.execute(f"UPDATE {table} SET id=nextval('{table}_id_seq');")
    session.commit()
    session.flush()
    return f"{table} Truncated"
