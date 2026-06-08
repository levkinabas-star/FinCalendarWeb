# FinCalendar Payment API

Express.js сервер для обработки платежей через YooKassa.

## Быстрый старт

```bash
npm install
cp .env.example .env
# Заполните YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env
npm start
```

Сервер запустится на порту 4000 (или PORT из переменных окружения).

## Переменные окружения

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `YOOKASSA_SHOP_ID` | ✅ | ID магазина из YooKassa |
| `YOOKASSA_SECRET_KEY` | ✅ | Секретный ключ из YooKassa |
| `APP_URL` | ✅ | URL фронтенда (для return_url) |
| `PORT` | Нет | Порт сервера (по умолчанию 4000) |

## API Endpoints

### `POST /api/payments/create`
Создание платежа.

**Request body:**
```json
{ "billing": "monthly" }  // или "yearly"
```

**Response:**
```json
{
  "id": "2c7a6d9f-...",
  "confirmationUrl": "https://yoomoney.ru/..."
}
```

### `GET /api/payments/:id`
Проверка статуса платежа.

**Response:**
```json
{
  "id": "2c7a6d9f-...",
  "status": "succeeded",
  "billing": "monthly"
}
```

### `GET /health`
Проверка работоспособности.

**Response:**
```json
{ "ok": true }
```

## Деплой

### Docker

```bash
docker build -t fincalendar-api .
docker run -d -p 4000:4000 \
  -e YOOKASSA_SHOP_ID=your_shop_id \
  -e YOOKASSA_SECRET_KEY=your_secret_key \
  -e APP_URL=https://your-domain.com \
  fincalendar-api
```

### Timeweb Cloud

1. Подключите репозиторий к Timeweb Cloud
2. Настройте переменные окружения в панели управления
3. Разверните через Docker

### Render / Railway /其他 платформы

Платформы автоматически распознают Dockerfile и запустят сервер.

## YooKassa Webhook (опционально)

Для получения уведомлений о платежах настройте webhook в личном кабинете YooKassa:
- URL: `https://your-api-domain.com/api/payments/webhook`
