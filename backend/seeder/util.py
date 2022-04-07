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
        if not clist:
            clist = crud.add_cascade_list(session=session,
                                          payload=clist_payload)
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
            if not child:
                child = crud.add_cascade_list(session=session,
                                              payload=child_payload)
