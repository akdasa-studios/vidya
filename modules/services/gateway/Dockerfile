FROM nginx:latest

# Удаляем дефолтную конфигурацию, чтобы избежать конфликтов
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш основной конфигурационный файл и настройки endpoint'ов в образ
COPY nginx.conf /etc/nginx/nginx.conf
COPY endpoints.conf /etc/nginx/conf.d/endpoints.conf
