# FinCalendar API — Dockerfile для Timeweb Cloud

FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --omit=dev

# Копируем исходный код
COPY server.js ./

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Запуск сервера
CMD ["node", "server.js"]
