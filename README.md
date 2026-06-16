# FinCalendar Frontend

Фронтенд приложения FinCalendar — личный трекер бюджета с React + Vite.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Копируйте .env.example в .env и настройте VITE_API_URL
cp .env.example .env

# Запуск dev сервера
npm run dev
```

## Переменные окружения

| Переменная | Описание | Обязательно |
|------------|----------|------------|
| `VITE_API_URL` | URL бэкенда для платежей | ✅ |
| `VITE_SUPABASE_URL` | URL Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | ✅ |

## Сборка

```bash
# Продакшен сборка
npm run build

# Результат в папке dist/
```

## Деплой

См. [DEPLOY.md](./DEPLOY.md) для подробной инструкции по деплою.
