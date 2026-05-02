FROM nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 \
        -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/authabstract.key \
        -out    /etc/nginx/ssl/authabstract.crt \
        -subj "/C=US/ST=Local/L=Local/O=AuthAbstract/OU=Self-Signed/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
