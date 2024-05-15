FROM node:18-bookworm-slim

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY reviews.js .
COPY reviews.graphql .

CMD [ "node", "reviews.js" ]
