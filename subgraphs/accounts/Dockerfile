FROM node:18-bookworm-slim

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY accounts.js .
COPY accounts.graphql .

CMD [ "node", "accounts.js" ]
