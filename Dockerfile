FROM oven/bun:1-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun --bun run build

HEALTHCHECK --interval=5s --start-period=30s --start-interval=1s CMD curl -f "http://localhost:$PORT/api/health" || exit 1

ENV PORT=80
EXPOSE $PORT

CMD ["bun", "/app/build/index.js"]

# TODO: remove when graceful shutfown is handled
STOPSIGNAL SIGKILL
