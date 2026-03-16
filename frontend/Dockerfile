# Build stage – Node.js 20 LTS
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage – minimal image with only standalone output
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy standalone output from build (no node_modules needed)
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Backend URL for SignalR rewrites (override at run time)
ENV BACKEND_BASE_URL=https://api.ecorent.site

ENTRYPOINT ["node", "server.js"]
