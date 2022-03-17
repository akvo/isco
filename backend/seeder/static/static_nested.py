# Defined Values

nested_lv1 = ["Sports", "Technology"]
nested_lv2_sport = ["Basketball", "Football", "Tennis"]
nested_lv2_tech = ["Programming", "Games", "Youtuber"]

cascades = []
for l1 in nested_lv1:
    cascades.append(
        {
            "cascade": None,
            "parent": None,
            "code": None,
            "name": l1,
            "path": None,
            "level": 1,
        }
    )

for l2 in nested_lv2_sport:
    cascades.append(
        {
            "cascade": None,
            "parent": 18,
            "code": None,
            "name": l2,
            "path": "18.",
            "level": 2,
        }
    )

for l2 in nested_lv2_tech:
    cascades.append(
        {
            "cascade": None,
            "parent": 19,
            "code": None,
            "name": l2,
            "path": "19.",
            "level": 2,
        }
    )

nested_values = {
    "name": "Sport & Technology",
    "type": "nested",
    "cascades": cascades
}
