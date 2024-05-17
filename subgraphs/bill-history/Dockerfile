FROM node:18-bookworm-slim

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY bill-history.js .
COPY bill-history.graphql .

CMD [ "node", "bill-history.js" ]
