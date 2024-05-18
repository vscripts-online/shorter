ARG NODE_VERSION=20.7.0

FROM node:${NODE_VERSION}-alpine as build

# here we are reading the value from the build args and inserting into the environment variables
ARG NEXT_PUBLIC_VERCEL_URL
ENV NEXT_PUBLIC_VERCEL_URL=${NEXT_PUBLIC_VERCEL_URL}

# here we are reading the value from the build args and inserting into the environment variables
ARG NEXT_PUBLIC_REDIRECT_HOST
ENV NEXT_PUBLIC_REDIRECT_HOST=${NEXT_PUBLIC_REDIRECT_HOST}

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci

COPY . .

RUN npm run build

CMD [ "npm", "run", "start" ]
