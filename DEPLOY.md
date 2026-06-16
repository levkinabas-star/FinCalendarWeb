# Инструкция по деплою FinCalendar API на Timeweb Cloud

## Предварительные требования

1. **Аккаунт Timeweb Cloud** с пополненным балансом
2. **ЮKassa аккаунт** с настроенным магазином
3. **SSH-доступ** к серверу (или терминал через панель управления)

---

## Шаг 1: Регистрация в ЮKassa

1. Перейдите на [https://yookassa.ru](https://yookassa.ru) и зарегистрируйтесь
2. В личном кабинете создайте магазин
3. Получите:
   - **Shop ID** (например, `123456`)
   - **Секретный ключ** (строка вида `test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

4. В настройках магазина включите:
   - Тестовый режим (для проверки)
   - HTTP-хоки для уведомлений

---

## Шаг 2: Создание сервера на Timeweb Cloud

### Через панель управления:

1. Войдите в [панель Timeweb Cloud](https://timeweb.cloud)
2. Нажмите **"Создать сервер"**
3. Выберите конфигурацию:
   - **ОС**: Ubuntu 22.04 LTS
   - **Тариф**: Минимум 1 vCPU, 1 GB RAM
   - **Диск**: 10 GB SSD
4. Создайте сервер и сохраните IP-адрес

### Начальная настройка сервера:

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# Обновите систему
apt update && apt upgrade -y

# Установите Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установите PM2 глобально
npm install -g pm2

# Установите Nginx
apt install -y nginx

# Настройте firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Шаг 3: Деплой бэкенда

### Вариант A: Git + Pull (рекомендуется)

```bash
# На сервере
cd /var/www
git clone https://github.com/ВАШ_USERNAME/fincalendar-backend.git fincalendar-api
cd fincalendar-api

# Установите зависимости
npm install

# Создайте файл .env
nano .env
```

**Содержимое `.env`:**
```env
NODE_ENV=production
PORT=4000
APP_URL=https://ваш-домен.ru
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_секретный_ключ
ALLOWED_ORIGINS=https://ваш-домен.ru
```

```bash
# Запустите через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Вариант B: Docker (альтернативный)

```bash
# На сервере установите Docker
curl -fsSL https://get.docker.com | sh

# Сборка и запуск
cd /var/www/fincalendar-api
docker build -t fincalendar-api .
docker run -d \
  --name fincalendar-api \
  -p 4000:4000 \
  --restart unless-stopped \
  --env-file .env \
  fincalendar-api
```

---

## Шаг 4: Настройка Nginx как reverse proxy

```bash
nano /etc/nginx/sites-available/fincalendar-api
```

**Содержимое:**
```nginx
server {
    listen 80;
    server_name api.ваш-домен.ru;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируйте конфиг
ln -s /etc/nginx/sites-available/fincalendar-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Шаг 5: Настройка SSL (HTTPS)

```bash
# Установите Certbot
apt install -y certbot python3-certbot-nginx

# Получите SSL-сертификат
certbot --nginx -d api.ваш-домен.ru
```

---

## Шаг 6: Настройка webhook в ЮKassa

1. В личном кабинете ЮKassa перейдите в **Настройки магазина** → **HTTP-хоки**
2. Добавьте URL: `https://api.ваш-домен.ru/api/webhook`
3. Сохраните секрет для webhook (опционально)

---

## Проверка работы API

```bash
# Проверьте, что сервер запущен
pm2 list
# или
docker ps

# Проверьте health endpoint
curl https://api.ваш-домен.ru/health

# Ожидаемый ответ:
# {"ok":true}
```

---

## Команды управления PM2

```bash
# Просмотр логов
pm2 logs fincalendar-api

# Перезапуск
pm2 restart fincalendar-api

# Остановка
pm2 stop fincalendar-api

# Мониторинг
pm2 monit

# Обновление после git pull
cd /var/www/fincalendar-api
git pull
npm install
pm2 restart fincalendar-api
```

---

## Возможные проблемы

### Порт 4000 занят
```bash
# Найдите процесс
lsof -i :4000
# или
netstat -tlnp | grep 4000

# Убейте процесс или измените PORT в .env
```

### ЮKassa возвращает ошибку 402
- Проверьте, что Shop ID и Secret Key корректны
- Убедитесь, что магазин активирован в ЮKassa
- Для тестирования используйте тестовые карты

### CORS ошибки
- Проверьте переменную `ALLOWED_ORIGINS` в `.env`
- Формат: `https://ваш-домен.ru` (без слэша в конце)

---

## Структура файлов на сервере

```
/var/www/fincalendar-api/
├── server.js          # Основной файл сервера
├── package.json       # Зависимости
├── .env               # Переменные окружения (НЕ в git!)
├── ecosystem.config.js # Конфиг PM2
├── Dockerfile         # Для Docker (опционально)
└── logs/              # Логи PM2 (создаётся автоматически)
```

---

## Автоматическое обновление

### Для Git-based деплоя:

```bash
# Создайте скрипт обновления
cat > /var/www/update-api.sh << 'EOF'
#!/bin/bash
cd /var/www/fincalendar-api
git pull
npm install --production
pm2 restart fincalendar-api
EOF

chmod +x /var/www/update-api.sh
```

### Cron для автоматических обновлений (опционально):
```bash
crontab -e
# Добавить строку:
# 0 */6 * * * /var/www/update-api.sh >> /var/log/update-api.log 2>&1
```

---

## Полезные ссылки

- [Документация Timeweb Cloud](https://timeweb.cloud/docs)
- [Документация ЮKassa](https://yookassa.ru/developers)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
