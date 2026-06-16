# FinCalendar API

Бэкенд FinCalendar с обработкой платежей через ЮKassa.

## Деплой на Timeweb Cloud

### Настройки при создании проекта:

| Параметр | Значение |
|----------|----------|
| Репозиторий | `levkinabas-star/FinCalendarWeb` |
| Ветка | `backend` |
| Runtime | Node.js 20 |
| Build | `npm ci` |
| Start | `npm start` |

### Переменные окружения:

```
NODE_ENV=production
PORT=4000
APP_URL=https://ваш-домен.ru
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_секретный_ключ
ALLOWED_ORIGINS=https://ваш-домен.ru
```

## Локальный запуск

```bash
npm install
cp .env.example .env  # Заполните переменные
npm start
```

## API Endpoints

- `GET /health` — Проверка работоспособности
- `POST /api/payments/create` — Создание платежа
- `GET /api/payments/:id` — Статус платежа
