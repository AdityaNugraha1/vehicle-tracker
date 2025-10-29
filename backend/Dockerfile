FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY prisma/schema.prisma ./prisma/

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "dist/server.js"]