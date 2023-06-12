FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.7.0

ADD dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/
COPY sentry-cli.bash .sentryclirc deploy.bash /

ARG apiDomain=
ARG ENV=dev
ARG SENSOR_PROJECT=

ENV apiDomain=${apiDomain}
ENV ENV=${ENV}
ENV SENSOR_PROJECT=${SENSOR_PROJECT}

RUN /bin/bash ./sentry-cli.bash


RUN cat deploy.bash

CMD /bin/bash ./deploy/deploy.bash && nginx -g 'daemon off;'

EXPOSE 80
