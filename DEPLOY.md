# FinCalendar API — Деплой на Timeweb Cloud

## Быстрый деплой

### Шаг 1: Создайте проект на Timeweb Cloud

1. Войдите в [Timeweb Cloud](https://timeweb.cloud)
2. Перейдите в **Панель управления** → **Создать проект**
3. Выберите **Node.js**
4. Подключите репозиторий: `levkinabas-star/FinCalendarWeb`
5. Выберите ветку: `backend`

### Шаг 2: Настройки при создании проекта

```
Репозиторий:  levkinabas-star/FinCalendarWeb
Ветка:        backend
Runtime:      Node.js 20
Build:        npm ci
Start:        npm start
```

### Шаг 3: Переменные окружения (Environment)

При деплое добавьте переменные:

| Переменная | Значение | Обязательно |
|------------|----------|-------------|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `4000` | ✅ |
| `APP_URL` | `https://ваш-домен.ru` | ✅ |
| `YOOKASSA_SHOP_ID` | Ваш Shop ID из ЮKassa | ✅ |
| `YOOKASSA_SECRET_KEY` | Ваш секретный ключ из ЮKassa | ✅ |
| `ALLOWED_ORIGINS` | `https://ваш-домен.ru` | ✅ |
| `PRICE_MONTHLY` | `100.00` | Нет |
| `PRICE_YEARLY` | `1000.00` | Нет |

### Шаг 4: Деплой

Нажмите **"Задеплоить"** — проект автоматически соберётся и запустится.

---

## Получение данных от ЮKassa

1. Зарегистрируйтесь на [https://yookassa.ru](https://yookassa.ru)
2. Создайте магазин и получите:
   - **Shop ID** — числовой ID
   - **Секретный ключ** — строка вида `test_xxx...`

3. В настройках магазина включите **HTTP-хоки**:
   - URL: `https://ваш-домен.ru/api/webhook`
   - События: `payment.succeeded`, `payment.canceled`

---

## Проверка работы

```bash
# Health check
curl https://ваш-домен.ru/health
# Ответ: {"ok":true}
```

---

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Проверка работоспособности |
| GET | `/` | Информация об API |
| POST | `/api/payments/create` | Создание платежа |
| GET | `/api/payments/:id` | Статус платежа |
| POST | `/api/payments/:id/cancel` | Отмена платежа |
| POST | `/api/payments/:id/refund` | Возврат платежа |
| POST | `/api/webhook` | Webhook от ЮKassa |

---

## Логи

Просмотр логов через Timeweb Cloud панель или:

```bash
# Через SSH
pm2 logs
```
