#!/bin/bash
# ============================================
# Скрипт деплоя FinCalendar Backend на Timeweb Cloud
# ============================================
# Использование:
#   wget https://raw.githubusercontent.com/ВАШ_USERNAME/fincalendar-backend/main/scripts/deploy.sh
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================

set -e

echo "========================================"
echo "FinCalendar Backend Deployment Script"
echo "========================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
	echo -e "${RED}Пожалуйста, запустите скрипт от имени root${NC}"
	exit 1
fi

# Запрос данных у пользователя
echo ""
echo -e "${YELLOW}Введите домен для API (например, api.example.com):${NC}"
read -r API_DOMAIN

echo -e "${YELLOW}Введите Shop ID из ЮKassa:${NC}"
read -r SHOP_ID

echo -e "${YELLOW}Введите Secret Key из ЮKassa:${NC}"
read -r SECRET_KEY

echo ""
echo "Начинаю установку..."

# Обновление системы
echo -e "${GREEN}1. Обновление системы...${NC}"
apt update && apt upgrade -y

# Установка Node.js
echo -e "${GREEN}2. Установка Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка PM2
echo -e "${GREEN}3. Установка PM2...${NC}"
npm install -g pm2

# Установка Nginx
echo -e "${GREEN}4. Установка Nginx...${NC}"
apt install -y nginx

# Настройка Firewall
echo -e "${GREEN}5. Настройка Firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Создание директории и клонирование
echo -e "${GREEN}6. Клонирование репозитория...${NC}"
mkdir -p /var/www
cd /var/www
git clone https://github.com/ВАШ_USERNAME/fincalendar-backend.git fincalendar-api
cd fincalendar-api

# Установка зависимостей
echo -e "${GREEN}7. Установка зависимостей...${NC}"
npm install

# Создание .env
echo -e "${GREEN}8. Создание .env файла...${NC}"
cat >.env <<EOF
NODE_ENV=production
PORT=4000
APP_URL=https://ваш-домен.ru
YOOKASSA_SHOP_ID=${SHOP_ID}
YOOKASSA_SECRET_KEY=${SECRET_KEY}
ALLOWED_ORIGINS=https://ваш-домен.ru
PRICE_MONTHLY=100.00
PRICE_YEARLY=1000.00
EOF

# Запуск через PM2
echo -e "${GREEN}9. Запуск сервера через PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Настройка Nginx
echo -e "${GREEN}10. Настройка Nginx...${NC}"
cat >/etc/nginx/sites-available/fincalendar-api <<EOF
server {
    listen 80;
    server_name ${API_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/fincalendar-api /etc/nginx/sites-enabled/
nginx -t

# Получение SSL
echo -e "${YELLOW}11. Для получения SSL сертификата выполните:${NC}"
echo -e "    certbot --nginx -d ${API_DOMAIN}"
echo ""

# Завершение
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Установка завершена!${NC}"
echo ""
echo -e "Следующие шаги:"
echo -e "  1. ${YELLOW} certbot --nginx -d ${API_DOMAIN} ${NC} - получение SSL"
echo -e "  2. ${YELLOW} nano /var/www/fincalendar-api/.env ${NC} - замените APP_URL на реальный домен"
echo -e "  3. ${YELLOW} pm2 restart fincalendar-api ${NC} - перезапуск после изменений"
echo -e "  4. ${YELLOW} curl https://${API_DOMAIN}/health ${NC} - проверка"
echo ""
echo -e "${GREEN}========================================${NC}"
