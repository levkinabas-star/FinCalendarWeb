#!/bin/bash
# ============================================
# Скрипт деплоя FinCalendar Frontend на Timeweb Cloud
# ============================================
# Использование:
#   wget https://raw.githubusercontent.com/ВАШ_USERNAME/fincalendar-frontend/main/scripts/deploy.sh
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================

set -e

echo "========================================"
echo "FinCalendar Frontend Deployment Script"
echo "========================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
	echo -e "${RED}Пожалуйста, запустите скрипт от имени root${NC}"
	exit 1
fi

# Запрос данных
echo ""
echo -e "${YELLOW}Введите домен для сайта (например, example.com):${NC}"
read -r DOMAIN

echo -e "${YELLOW}Введите URL бэкенда (например, https://api.example.com):${NC}"
read -r API_URL

echo ""
echo "Начинаю установку..."

# Проверка Node.js
echo -e "${GREEN}1. Проверка Node.js...${NC}"
if ! command -v node &>/dev/null; then
	echo "Установка Node.js..."
	curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
	apt install -y nodejs
fi

# Установка Nginx
echo -e "${GREEN}2. Установка Nginx...${NC}"
apt install -y nginx

# Создание директории
echo -e "${GREEN}3. Создание директории...${NC}"
mkdir -p /var/www/fincalendar-frontend

# Клонирование
echo -e "${GREEN}4. Клонирование репозитория...${NC}"
cd /var/www
rm -rf fincalendar-frontend
git clone https://github.com/ВАШ_USERNAME/fincalendar-frontend.git fincalendar-frontend
cd fincalendar-frontend

# Установка зависимостей
echo -e "${GREEN}5. Установка зависимостей...${NC}"
npm install

# Создание .env
echo -e "${GREEN}6. Создание .env файла...${NC}"
cat >.env <<EOF
VITE_API_URL=${API_URL}
VITE_SUPABASE_URL=https://lcqobtfifmerfkwtdxov.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_IytVqQUhLOSZ3eI7xupFqA_OMRYZy6H
EOF

# Сборка
echo -e "${GREEN}7. Сборка проекта...${NC}"
npm run build

# Копирование в корень Nginx
echo -e "${GREEN}8. Настройка Nginx...${NC}"
rm -rf /var/www/fincalendar-frontend
mkdir -p /var/www/fincalendar-frontend

cat >/etc/nginx/sites-available/fincalendar-frontend <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    root /var/www/fincalendar-frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/fincalendar-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Завершение
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Установка завершена!${NC}"
echo ""
echo -e "Следующие шаги:"
echo -e "  1. ${YELLOW} certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} ${NC} - получение SSL"
echo -e "  2. ${YELLOW} curl https://${DOMAIN} ${NC} - проверка сайта"
echo ""
echo -e "${GREEN}========================================${NC}"
