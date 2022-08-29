FROM node:16

COPY . /app

RUN npm install -g pm2
ENTRYPOINT [ "/app/run.sh" ]

