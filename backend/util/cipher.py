import functools

keys = "fiz4078b6aentq1ohy-5mgkswvcrxju3p2dl9"
chars = "5qojp2gzwy8vns-9id4aretl6mkx7h10bcu3f"
an = len(chars)


class Cipher():
    def __init__(self, str_param):
        self.str_param = str_param

    def encode(self):
        n = self.str_param.split("-")[1]
        n = functools.reduce(lambda a, b: a + b, list(str(n)))
        n = str(n)[-1]
        nab = "".join([
            chars[-i if i + int(n) > an else int(n) + i - an]
            for i, a in enumerate(chars)
        ])
        ad = "".join(
            [keys[nab.find(a)] if a in nab else a for a in self.str_param])
        return f"{ad}{n}"

    # commented for now
    # def decode(self):
    #     n = int(self.str_param[-1])
    #     nab = "".join([
    #         chars[-i if i + int(n) > an else int(n) + i - an]
    #         for i, a in enumerate(chars)
    #     ])
    #     try:
    #         ad = "".join([
    #             nab[keys.find(a)] if a in keys else a
    #             for a in self.str_param[:-1]
    #         ])
    #         ad = ad.split("-")
    #         return ad[0], int(ad[1])
    #     except IndexError:
    #         pass
    #     return None, None
