FROM node:lts-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN --mount=type=cache,target=/usr/local/share/.cache yarn install --freeze-lockfile --verbose

COPY . .

RUN npm run build

CMD node ./build/index.js

