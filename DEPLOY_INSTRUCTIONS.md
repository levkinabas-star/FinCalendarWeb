# Инструкция по деплою FinCalendar на Timeweb Cloud

## Структура проекта

```
FinCalendar/
├── frontend/          # React SPA (публикуется как Docker + Nginx)
├── server/            # Express API (публикуется как Docker)
├── docker-compose.yml # Объединяет оба сервиса
└── DEPLOY_INSTRUCTIONS.md
```

---

## Шаг 1: Регистрация и создание сервера

1. Зайди на [Timeweb Cloud](https://timeweb.cloud) → Регистрация
2. Создай новый сервер:
   - **Тип**: Docker (или Ubuntu 22.04 + установи Docker)
   - **Тариф**: Минимальный для начала (1 vCPU, 1GB RAM достаточно)
   - **Регион**: Москва или ближайший

---

## Шаг 2: Установка Docker и Docker Compose

Подключись к серверу по SSH и выполни:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh

# Установка Docker Compose
sudo apt install docker-compose -y

# Добавление пользователя в группу docker (опционально)
sudo usermod -aG docker $USER
```

---

## Шаг 3: Клонирование проекта

```bash
# Зайди в директорию
cd /root

# Клонируй репозиторий
git clone https://github.com/levkinabas-star/FinCalendar.git

# Перейди в папку проекта
cd FinCalendar
```

---

## Шаг 4: Настройка переменных окружения

Создай файл `.env` для backend:

```bash
cd server
cat > .env << 'EOF'
YOOKASSA_SHOP_ID=1333678
YOOKASSA_SECRET_KEY=live_iIEDgMPk_93bVFvbIhykBTM_ZExWAMdE-yO3pgPZC9w
APP_URL=https://appfincalendar.ru
PORT=4000
EOF
cd ..
```

---

## Шаг 5: Привязка домена appfincalendar.ru

### В Timeweb Cloud:

1. **DNS-настройки** (если домен зарегистрирован отдельно):
   - Добавь A-запись: `@` → IP-адрес сервера
   - Добавь CNAME-запись: `www` → `@`

2. **SSL-сертификат** (через Let's Encrypt):
   ```bash
   cd /root/FinCalendar
   
   # Установка Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Получение сертификата (после запуска контейнеров)
   # Сначала запусти контейнеры, потом:
   sudo certbot --nginx -d appfincalendar.ru -d www.appfincalendar.ru
   ```

---

## Шаг 6: Запуск контейнеров

```bash
cd /root/FinCalendar

# Сборка и запуск
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

---

## Шаг 7: Обновление Nginx для SSL

После получения SSL-сертификата, обнови конфигурацию Nginx. Создай файл `/root/FinCalendar/nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name appfincalendar.ru www.appfincalendar.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name appfincalendar.ru www.appfincalendar.ru;

    ssl_certificate /etc/letsencrypt/live/appfincalendar.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appfincalendar.ru/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прокси на backend
    location /api/ {
        proxy_pass http://backend:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Шаг 8: Настройка webhook в ЮKassa

1. Зайди в [личный кабинет ЮKassa](https://yookassa.ru)
2. Перейди в **Настройки → Вебхуки**
3. Добавь webhook:
   - **URL**: `https://appfincalendar.ru/api/payments/webhook`
   - **События**: `payment.succeeded`, `payment.canceled`

---

## Проверка работы

### Backend API:
```bash
curl http://localhost:4000/health
# Должен вернуть: {"ok":true}
```

### Frontend:
Открой в браузере: `http://<IP-сервера>:8080`

---

## Команды управления

```bash
# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Обновление кода
git pull
docker-compose up -d --build

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Возможные проблемы

### 1. Контейнер не запускается
```bash
docker-compose logs backend
# Проверь, что .env файл создан
```

### 2. Ошибка SSL
```bash
# Проверь, что сертификат получен
sudo certbot certificates
```

### 3. ЮKassa возвращает ошибку
- Проверь, что `YOOKASSA_SECRET_KEY` верный
- Убедись, что Shop ID активен в ЮKassa

---

## Контакты для поддержки

- GitHub: https://github.com/levkinabas-star/FinCalendar
- ЮKassa: https://yookassa.ru
- Timeweb Cloud: https://timeweb.cloud
