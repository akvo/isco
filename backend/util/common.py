from datetime import datetime, timedelta


def get_prev_year(prev: int = 1, year: bool = False):
    current = datetime.now()
    previous = timedelta(prev * 365)
    res = current - previous
    if year:
        return res.year
    return res
