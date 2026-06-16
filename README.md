# FinCalendar API

Бэкенд для FinCalendar с обработкой платежей через ЮKassa.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Создайте .env из примера
cp .env.example .env

# Запустите сервер
npm start
```

## API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/health` | GET | Проверка здоровья API |
| `/api/payments/create` | POST | Создание платежа |
| `/api/payments/:id` | GET | Статус платежа |
| `/api/payments/:id/cancel` | POST | Отмена платежа |
| `/api/payments/:id/refund` | POST | Возврат платежа |
| `/api/webhook` | POST | Webhook от ЮKassa |

## Переменные окружения

См. файл `.env.example`

## Деплой

См. [DEPLOY.md](./DEPLOY.md) для подробной инструкции по деплою.
