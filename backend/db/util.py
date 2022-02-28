import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import TypeDecorator
import re


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


class ArrayOfEnum(TypeDecorator):
    impl = pg.ARRAY

    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)

    def result_processor(self, dialect, coltype):
        super_rp = super(ArrayOfEnum, self).result_processor(dialect, coltype)

        def handle_raw_string(value):
            inner = re.match(r"^{(.*)}$", value).group(1)
            return inner.split(",") if inner else []

        def process(value):
            if value is None:
                return None
            return super_rp(handle_raw_string(value))
        return process
