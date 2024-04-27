FROM node:lts

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN yarn install --freeze-lockfile --verbose

COPY . .

RUN npm run build

CMD node ./build/index.js
