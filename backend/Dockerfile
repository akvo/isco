FROM amancevice/pandas:0.24.2-slim

WORKDIR /usr/src/app

COPY . .

RUN set -e; \
    pip -q install --upgrade pip && \
    pip -q install --no-cache-dir -r requirements.txt && \
    pip check


CMD ["sh", "./run.sh"]