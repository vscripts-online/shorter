ARG NODE_VERSION=20.7.0

FROM node:${NODE_VERSION}-alpine as build

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci

COPY . .

RUN npm run build

CMD [ "npm", "run", "start" ]
