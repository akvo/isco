import db.crud_cascade as crud


def cascade_seeder(session, data):
    # seed cascade
    cascade_payload = {
        "name": data["name"],
        "type": data["type"],
        "cascades": None
    }
    cascade = crud.get_cascade_by_name(session=session,
                                       name=data['name'],
                                       ctype=data['type'])
    if not cascade:
        cascade = crud.add_cascade(session=session,
                                   payload=cascade_payload)
    for d in data["cascades"]:
        clist_payload = {
            "cascade": cascade.id,
            "parent": None,
            "code": None,
            "name": d["name"],
            "path": None,
            "level": d["level"]
        }
        clist = crud.get_cascade_list_by_name(session=session,
                                              name=d['name'],
                                              cascade=cascade.id)
        cond1 = not clist and "action" not in d
        cond2 = not clist and "action" in d and d["action"] == "new"
        if cond1 or cond2:
            clist = crud.add_cascade_list(session=session,
                                          payload=clist_payload)
        # delete cascade list
        if clist and "action" in d and d["action"] == "delete":
            crud.delete_cascade_list(session=session, id=clist.id)

        # seed cascade childs
        for c in d["childrens"]:
            child_payload = {
                "cascade": cascade.id,
                "parent": clist.id,
                "code": None,
                "name": c["name"],
                "path": f"{clist.id}.",
                "level": c["level"]
            }
            child = crud.get_cascade_list_by_name(session=session,
                                                  name=c['name'],
                                                  cascade=cascade.id,
                                                  parent=clist.id)
            cond3 = not child and "action" not in c
            cond4 = not child and "action" in c and c["action"] == "new"
            if cond3 or cond4:
                child = crud.add_cascade_list(session=session,
                                              payload=child_payload)
            # delete cascade list childs
            if child and "action" in c and c["action"] == "delete":
                crud.delete_cascade_list(session=session, id=child.id)
