# FinCalendar Frontend

Фронтенд приложения FinCalendar — личный трекер бюджета с React + Vite.

## Деплой на Timeweb Cloud

### Настройки при создании проекта:

| Параметр | Значение |
|----------|----------|
| Репозиторий | `levkinabas-star/FinCalendarWeb` |
| Ветка | `frontend` |
| Runtime | Node.js 20 |
| Build | `npm ci && npm run build` |
| Start | `npx serve -s dist -l 3000` |

### Обязательная переменная окружения:

```
VITE_API_URL=https://api.ваш-домен.ru
```

### Опциональные переменные (Supabase):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Если оставить пустыми — данные будут храниться локально в браузере.

## Локальный запуск

```bash
npm install
cp .env.example .env  # Укажите VITE_API_URL
npm run dev
```

## Сборка

```bash
npm run build
```
