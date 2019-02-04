FROM node:8.12.0-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . ./migrations

CMD [ "npm", "run", "migrate" ]
