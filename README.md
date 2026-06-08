# FinCalendar Web — Деплой на Timeweb Cloud

## Структура проекта

```
FinCalendarWeb/
├── src/              # React SPA
├── dist/             # Билд для продакшена (генерируется)
├── server/           # Express API (бэкенд для оплат)
├── promto.yaml       # Конфиг для Promto Publish
├── Dockerfile        # Docker для Timeweb Cloud
├── nginx.conf        # Nginx конфиг
└── .env              # Переменные окружения
```

## Переменные окружения (.env)

```env
# URL бэкенд API
VITE_API_URL=https://levkinabas-star-fincalendarweb-003c.twc1.net

# Supabase
VITE_SUPABASE_URL=https://lcqobtfifmerfkwtdxov.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Деплой на Timeweb Cloud

### Шаг 1: Подготовка

1. Убедитесь, что в репозитории есть `promto.yaml` с конфигурацией сервиса
2. Ветка `frontend-deploy` уже настроена для деплоя

### Шаг 2: Через панель Timeweb Cloud

1. Откройте [Timeweb Cloud](https://timeweb.cloud)
2. Перейдите в **App Platform** → **Создать приложение**
3. Выберите **Frontend** → **React**
4. Подключите репозиторий `levkinabas-star/FinCalendarWeb`
5. Выберите ветку `frontend-deploy`
6. Укажите:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
7. Нажмите **Создать**

### Шаг 3: Привязка домена

1. После создания приложения перейдите в **Настройки**
2. Добавьте домен: `levkinabas-star-fincalendarweb-003c.twc1.net`
3. DNS записи создаются автоматически

### Шаг 4: Настройка переменных окружения

В настройках приложения добавьте:

| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | `https://levkinabas-star-fincalendarweb-003c.twc1.net` |
| `VITE_SUPABASE_URL` | `https://lcqobtfifmerfkwtdxov.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ваш_ключ |

### Шаг 5: Деплой

1. Нажмите **Deploy** или сделайте push в ветку `frontend-deploy`
2. Дождитесь сборки (2-5 минут)
3. Приложение будет доступно по адресу: `https://levkinabas-star-fincalendarweb-003c.twc1.net`

## Альтернативный деплой (Docker)

Если Timeweb предлагает Docker-деплой:

1. Используйте готовый `Dockerfile` в корне проекта
2. Образ собирается автоматически при деплое

## API Endpoints

Фронтенд обращается к бэкенду:

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/payments/create` | Создание платежа YooKassa |
| GET | `/api/payments/:id` | Проверка статуса платежа |

## Возможные проблемы

### CORS ошибки
Убедитесь, что `VITE_API_URL` указывает на正确的 URL бэкенда без слеша в конце.

### 404 на статических файлах
Проверьте, что `publish_dir` установлен в `dist`.

### Ошибки сборки
```bash
npm install
npm run build
```
Локальная сборка поможет выявить проблемы до деплоя.

## Полезные ссылки

- [Timeweb Cloud App Platform](https://timeweb.cloud/docs/apps)
- [Документация Timeweb](https://timeweb.cloud/docs)
