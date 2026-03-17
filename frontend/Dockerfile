# Build stage – Node.js 20 LTS
FROM node:20-alpine AS build
WORKDIR /app

# Build args – NEXT_PUBLIC_* được bake vào client bundle lúc build
ARG NEXT_PUBLIC_API_BASE_URL=https://api.ecorent.site
ARG NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDGV2cdHjnSFZ025pPPiePPEUUdMkFHN8Y
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rentalcar-28d86.firebaseapp.com
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=rentalcar-28d86
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rentalcar-28d86.firebasestorage.app
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=287902982316
ARG NEXT_PUBLIC_FIREBASE_APP_ID=1:287902982316:web:f8819662f43c841a993f09

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

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
