# Defined Values
cascade_lv1 = ["Java", "Bali"]
cascade_lv2_java = ["Banten", "Jakarta", "Jawab Barat",
                    "Jawa Tengah", "Yogyakarta", "Jawa Timur"]
cascade_lv2_bali = ["Badung", "Bangli", "Buleleng",
                    "Gianyar", "Jembrana", "Karangasem",
                    "Klungkung", "Tabanan", "Denpasar"]

cascades = []
for l1 in cascade_lv1:
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

for l2 in cascade_lv2_java:
    cascades.append(
        {
            "cascade": None,
            "parent": 1,
            "code": None,
            "name": l2,
            "path": "1.",
            "level": 2,
        }
    )

for l2 in cascade_lv2_bali:
    cascades.append(
        {
            "cascade": None,
            "parent": 2,
            "code": None,
            "name": l2,
            "path": "2.",
            "level": 2,
        }
    )

cascade_values = {
    "name": "Bali and Java",
    "type": "cascade",
    "cascades": cascades
}
