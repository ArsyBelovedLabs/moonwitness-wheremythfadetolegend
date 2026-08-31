FROM node:24-alpine AS build
WORKDIR /app

RUN apk add --no-cache git openssh-client \
  && git config --global url."https://github.com/".insteadOf ssh://git@github.com/ \
  && git config --global url."https://github.com/".insteadOf git@github.com:

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
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
