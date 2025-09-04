FROM node:16

RUN npm install -g pm2

COPY . /app
WORKDIR /app

HEALTHCHECK CMD curl --fail http://localhost:8080/health || exit 1

CMD ["pm2-runtime", "start", "api/event.js"]