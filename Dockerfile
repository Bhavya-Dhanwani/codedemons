# CLIENT
FROM node:20-alpine AS client-builder

WORKDIR /app

COPY client/package*.json ./

RUN npm i

COPY client/ ./

RUN npm run build

# SERVER
FROM node:20-alpine AS server-builder

WORKDIR /app

COPY server/package*.json ./

RUN npm i

COPY server/ ./

RUN npm run build

# COMBINED
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY server/package*.json ./

RUN npm ci --omit=dev

COPY --from=server-builder /app/dist ./
COPY --from=client-builder /app/dist ./public

EXPOSE 5000

CMD ["node", "server.js"]