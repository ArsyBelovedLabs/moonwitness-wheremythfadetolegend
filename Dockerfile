# syntax=docker/dockerfile:1.7
FROM node:24.20.0-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=secret,id=npm_token \
  set -eu; \
  TOKEN="$(cat /run/secrets/npm_token)"; \
  printf '%s\n' \
    '@arsybelovedlabs:registry=https://npm.pkg.github.com' \
    "//npm.pkg.github.com/:_authToken=${TOKEN}" \
    'always-auth=true' > /tmp/moonwitness-npmrc; \
  NPM_CONFIG_USERCONFIG=/tmp/moonwitness-npmrc pnpm install --no-frozen-lockfile; \
  rm -f /tmp/moonwitness-npmrc

COPY . .
RUN pnpm build

FROM node:24.20.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/dist ./dist
COPY api ./api
COPY data ./data
COPY docker ./docker
COPY package.json ./package.json

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1

CMD ["node", "docker/server.mjs"]
