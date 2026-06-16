# Инструкция по деплою FinCalendar Frontend на Timeweb Cloud

## Предварительные требования

1. **Аккаунт Timeweb Cloud** с пополненным балансом
2. **Домен** (опционально, но рекомендуется)
3. **SSL-сертификат** (бесплатно через Let's Encrypt)
4. **Бэкенд уже задеплоен** (см. [DEPLOY.md бэкенда](../fincalendar-backend/DEPLOY.md))

---

## Шаг 1: Настройка переменных окружения

Перед деплоем создайте файл `.env` с реальным URL вашего бэкенда:

```bash
VITE_API_URL=https://api.ваш-домен.ru
VITE_SUPABASE_URL=https://lcqobtfifmerfkwtdxov.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_IytVqQUhLOSZ3eI7xupFqA_OMRYZy6H
```

**ВАЖНО:** `VITE_` переменные должны быть определены **до** сборки, так как они вшиваются в бандл.

---

## Шаг 2: Локальная сборка (опционально)

Если хотите собрать локально:

```bash
# Перейдите в директорию фронтенда
cd fincalendar-frontend

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env
# Отредактируйте .env с реальным URL бэкенда

# Соберите продакшен-версию
npm run build

# Проверьте результат
ls dist/
```

---

## Шаг 3: Деплой на Timeweb Cloud

### Вариант A: Git + Pull (рекомендуется)

```bash
# На сервере
cd /var/www

# Клонируйте репозиторий (или создайте новый для фронтенда)
git clone https://github.com/ВАШ_USERNAME/fincalendar-frontend.git fincalendar-frontend
cd fincalendar-frontend

# Установите Node.js (если ещё не установлен)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установите зависимости
npm install

# Создайте .env файл с реальным URL бэкенда
cat > .env << 'EOF'
VITE_API_URL=https://api.ваш-домен.ru
VITE_SUPABASE_URL=https://lcqobtfifmerfkwtdxov.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_IytVqQUhLOSZ3eI7xupFqA_OMRYZy6H
EOF

# Соберите проект
npm run build

# Создайте директорию для статики Nginx
mkdir -p /var/www/fincalendar-frontend
cp -r dist/* /var/www/fincalendar-frontend/
```

### Вариант B: Docker

```bash
# На сервере
cd /var/www/fincalendar-frontend

# Сборка с указанием API URL
docker build \
  --build-arg VITE_API_URL=https://api.ваш-домен.ru \
  -t fincalendar-frontend .

# Запуск
docker run -d \
  --name fincalendar-frontend \
  -p 80:80 \
  --restart unless-stopped \
  fincalendar-frontend
```

---

## Шаг 4: Настройка Nginx

```bash
# Скопируйте конфиг
cp nginx.conf /etc/nginx/sites-available/fincalendar-frontend

# Отредактируйте конфиг
nano /etc/nginx/sites-available/fincalendar-frontend
```

**Измените `server_name` на ваш домен:**
```nginx
server_name ваш-домен.ru www.ваш-домен.ru;
```

```bash
# Активируйте конфиг
ln -s /etc/nginx/sites-available/fincalendar-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Шаг 5: Настройка SSL (HTTPS)

```bash
# Установите Certbot
apt install -y certbot python3-certbot-nginx

# Получите SSL-сертификат
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автоматическое продление
systemctl enable certbot.timer
```

---

## Шаг 6: Проверка работы

```bash
# Проверьте, что Nginx работает
systemctl status nginx

# Проверьте конфигурацию
nginx -t

# Откройте сайт в браузере
# https://ваш-домен.ru
```

---

## Возможные проблемы

### Белый экран после загрузки

1. Проверьте консоль браузера (F12 → Console)
2. Частая причина: неправильный `VITE_API_URL`
3. Пересоберите с правильным URL:
   ```bash
   npm run build
   ```

### Ошибки CORS

1. Убедитесь, что бэкенд настроен на ваш домен в `ALLOWED_ORIGINS`
2. Проверьте `VITE_API_URL` — должен быть HTTPS

### 404 при переходах (SPA)

Убедитесь, что в nginx.conf есть строка:
```nginx
try_files $uri $uri/ /index.html;
```

---

## Команды управления

```bash
# Пересборка после изменений
cd /var/www/fincalendar-frontend
git pull
npm install
npm run build
rm -rf /var/www/fincalendar-frontend/*
cp -r dist/* /var/www/fincalendar-frontend/
systemctl reload nginx

# Просмотр логов Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Обновление SSL
certbot renew
```

---

## Структура файлов на сервере

```
/var/www/fincalendar-frontend/
├── dist/                 # Собранные статические файлы
│   ├── index.html
│   ├── assets/
│   └── ...
├── .env                 # Переменные окружения (НЕ в git!)
├── nginx.conf           # Конфиг Nginx
└── package.json
```

---

## Автоматическое обновление

### Скрипт обновления:

```bash
cat > /var/www/update-frontend.sh << 'EOF'
#!/bin/bash
cd /var/www/fincalendar-frontend
git pull
npm install
npm run build
rm -rf /var/www/frontend-static/*
cp -r dist/* /var/www/frontend-static/
systemctl reload nginx
EOF

chmod +x /var/www/update-frontend.sh
```

---

## Полезные ссылки

- [Документация Vite](https://vitejs.dev/guide/static-deploy.html)
- [Настройка Nginx для SPA](https://nginx.org/en/docs/http/ngx_http_spa_module.html)
- [Timeweb Cloud](https://timeweb.cloud/docs)
