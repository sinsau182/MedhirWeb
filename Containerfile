# Base
FROM node:alpine AS base

# Deps
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Accept build-time arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ATTENDANCE_API_URL

# Inject as environment variables for build step
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ATTENDANCE_API_URL=${NEXT_PUBLIC_ATTENDANCE_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
# COPY .container/.env .env
RUN npm run build --omit=dev

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=custom
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ARG APPLICATION_USER=nodejs
RUN adduser --no-create-home -u 1001 -D $APPLICATION_USER
RUN chown -R $APPLICATION_USER /app
USER $APPLICATION_USER

EXPOSE 3000

ENV PORT 3000

COPY .container/entrypoint.sh /usr/local/bin/entrypoint.sh

# Set the entrypoint to the newly added script.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["node", "server.js"]