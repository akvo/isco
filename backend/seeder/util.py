import db.crud_cascade as crud


def process_cascade(session, cascade, data, parent_id=None, path=""):
    """
    Recursively processes cascades and
    ensures children are deleted before the parent
    """
    clist_payload = {
        "cascade": cascade.id,
        "parent": parent_id,
        "code": None,
        "name": data["name"],
        "path": path,
        "level": data["level"],
    }

    clist = crud.get_cascade_list_by_name(
        session=session,
        name=data["name"],
        cascade=cascade.id,
        parent=parent_id,
    )

    cond1 = not clist and "action" not in data
    cond2 = not clist and "action" in data and data["action"] == "new"
    if cond1 or cond2:
        clist = crud.add_cascade_list(session=session, payload=clist_payload)

    # Process children recursively first
    if clist and "childrens" in data and data["childrens"]:
        for child in data["childrens"]:
            process_cascade(
                session,
                cascade,
                child,
                parent_id=clist.id,
                path=f"{path}{clist.id}.",
            )

    # Handle deletion (after children are processed)
    if clist and "action" in data and data["action"] == "delete":
        crud.delete_cascade_list(session=session, id=clist.id)
        return  # Stop further processing if deleted

    # Handle update
    if clist and "action" in data and data["action"] == "update":
        if "update" in data:
            clist_payload["name"] = data["update"]
        crud.update_cascade_list(
            session=session, id=clist.id, payload=clist_payload
        )


def cascade_seeder(session, data):
    """Seed the cascade with nested child elements"""
    cascade_payload = {
        "name": data["name"],
        "type": data["type"],
        "cascades": None,
    }
    cascade = crud.get_cascade_by_name(session=session, name=data["name"])
    if not cascade:
        cascade = crud.add_cascade(session=session, payload=cascade_payload)
    if cascade and "action" in data and data["action"] == "update":
        # Update existing cascade
        cascade_payload["name"] = data["update"]
        cascade = crud.update_cascade(
            session=session, id=cascade.id, payload=cascade_payload
        )

    # Start recursive processing for cascades
    for d in data["cascades"]:
        process_cascade(session, cascade, d)
