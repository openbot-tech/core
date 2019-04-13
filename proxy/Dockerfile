FROM node:8.12.0-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*

RUN npm install

COPY . .

CMD [ "npm", "run", "proxy" ]
