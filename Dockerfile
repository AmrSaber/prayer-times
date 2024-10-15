# Install using yarn, as bun install has problems with docker
# See: https://github.com/oven-sh/bun/issues/10371
FROM node:lts-alpine AS install

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN --mount=type=cache,target=/usr/local/share/.cache yarn install --freeze-lockfile --verbose

# Build using bun
FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY --from=install /app /app
COPY . .

RUN bun --bun run build

# Run using bun
FROM oven/bun:1-alpine

# Health check
RUN apk add curl
HEALTHCHECK CMD curl -f "http://localhost:$PORT/api/health" || exit 1

COPY --from=build /app/build /app

ENV PORT=80
EXPOSE $PORT

WORKDIR /app
CMD ["bun", "/app/index.js"]

# TODO: remove when graceful shutdown is handled
STOPSIGNAL SIGKILL
