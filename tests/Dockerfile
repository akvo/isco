FROM akvo/akvo-node-17-alpine:20220121.024749.f30b815

RUN npm install -g selenium-side-runner

ADD run.sh /opt/bin/run.sh
RUN chmod +x /opt/bin/run.sh

RUN mkdir /sides

WORKDIR /root

VOLUME [ "/sides" ]

CMD "/opt/bin/run.sh"
