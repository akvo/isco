FROM akvo/akvo-node-17-alpine:20220121.024749.f30b815

RUN npm install -g selenium-side-runner

ADD docker-entrypoint.sh /opt/bin/docker-entrypoint.sh
RUN chmod +x /opt/bin/docker-entrypoint.sh

RUN mkdir /sides

WORKDIR /root

VOLUME [ "/sides" ]

CMD "/opt/bin/docker-entrypoint.sh"
