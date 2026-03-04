# /bin/sh
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
COPY --from=base /app/emailtemplates ./emailtemplates
COPY --from=base /app/src ./src

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]