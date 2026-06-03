FROM node:19-alpine@sha256:8ec543d4795e2e85af924a24f8acb039792ae9fe8a42ad5b4bf4c277ab34b62e as build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,id=npm,target=/root/.npm \
  npm ci

# build/Caddyfile以外をコピーする
COPY ./src/ ./src/
COPY ./index.html .
COPY ./tsconfig.json .
COPY ./vite.config.ts .
RUN npm run build


FROM caddy:2.7.6-alpine@sha256:2e1d4592f1718bb47645da5a83a846fe19094f18e6c921fdf56d174f05c63213
EXPOSE 80
COPY build/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
