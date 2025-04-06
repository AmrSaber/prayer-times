# Build using bun
FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .
RUN bun --bun run build

# Run using bun
FROM oven/bun:1-alpine

# Health check
RUN apk add curl
HEALTHCHECK --interval=5s --start-period=30s --start-interval=1s CMD curl -f "http://localhost:$PORT/api/health" || exit 1

COPY --from=build /app/build /app

ENV PORT=80
EXPOSE $PORT

WORKDIR /app
CMD ["bun", "/app/index.js"]

# TODO: remove when graceful shutfown is handled
STOPSIGNAL SIGKILL
