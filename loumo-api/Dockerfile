# ---- Build Stage ----
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate
RUN npm run build

# ---- Runtime Stage ----
FROM base AS runtime

WORKDIR /app

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/build ./build
COPY --from=base /app/assets ./app/assets
COPY --from=base /app/emailtemplates ./emailtemplates
COPY --from=base /app/src ./src

# Install production-only dependencies
# (optional if you've already installed them above)
# RUN npm ci --omit=dev

# Wait-for script (can also be added via volume or Dockerfile ADD)
ADD https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for /wait-for
RUN chmod +x /wait-for

EXPOSE 5000

CMD sh -c "npx prisma migrate deploy && \
  npm run start"