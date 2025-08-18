# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install production dependencies and devDependencies for build
RUN npm ci

# copy folders to container image
COPY . .

# Generate Prisma types for TypeScript build
RUN npx prisma generate && \
  npm run build

# ---- Runtime Stage ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/generated/prisma ./generated/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/build ./build
COPY --from=builder /app/emailtemplates ./emailtemplates

# Copy runtime code if needed
COPY --from=builder /app/src ./src

# Install production-only dependencies
# (optional if you've already installed them above)
# RUN npm ci --omit=dev

# Wait-for script (can also be added via volume or Dockerfile ADD)
ADD https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for /wait-for
RUN chmod +x /wait-for

EXPOSE 5000

# Run prisma migrations and start app after MySQL is up
CMD sh -c "/wait-for ${DB_HOST:-localhost}:${DB_PORT:-3306} --timeout=360 -- \
  npx prisma migrate deploy && \
  npm run start"

