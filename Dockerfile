FROM nginx:1.27-alpine
COPY nginx.template /etc/nginx/templates/default.conf.template
COPY public /usr/share/nginx/html
