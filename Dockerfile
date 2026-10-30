# syntax=docker/dockerfile:1

# Declared before the first FROM so that any stage can pick the value up by
# re-declaring the name. ARG does not otherwise cross a FROM boundary, and the
# runtime stage needs these to derive its own defaults from.
ARG VITE_API_URL
ARG VITE_SITE_URL

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app


FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_* values are inlined into the client bundle at build time, so they have
# to be present here. The browser resolves them, so they are addresses as seen
# from the host — unlike the runtime pair in the final stage. API_URL /
# SITE_URL are read from the environment at runtime instead.
ARG VITE_API_URL
# public origin: canonical / og:url / sitemap. `/` is prerendered during this
# stage, so its canonical is baked in here — set it to the real domain
ARG VITE_R2_URL
ARG VITE_SITE_URL
ARG VITE_SENTRY_DSN
ARG VITE_APP_VERSION
ARG VITE_MODE=production
# only used to upload source maps; never carried into the runtime image
ARG SENTRY_AUTH_TOKEN

RUN pnpm build


FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

# Read by process.env in app/api/server.server.ts. Re-declaring the global ARGs
# brings their values into this stage, so the runtime pair defaults to whatever
# the build was given and only has to be passed once.
#
# The two differ whenever the API is not reachable at the same address from the
# browser and from inside the container — a local API on the host is the usual
# case, and needs --build-arg API_URL=http://host.docker.internal:3000 at build
# time or -e API_URL=... at run time, either of which wins over the default.
ARG VITE_R2_URL
ARG VITE_API_URL
ARG VITE_SITE_URL
ARG API_URL=$VITE_API_URL
ARG SITE_URL=$VITE_SITE_URL

ENV API_URL=$API_URL
ENV SITE_URL=$SITE_URL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["pnpm", "start"]
