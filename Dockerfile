FROM node:8.12.0-alpine as base

ARG DATABASE_URL
ARG BITTREX_API_KEY
ARG BITTREX_API_SECRET
ENV DATABASE_URL $DATABASE_URL
ENV BITTREX_API_KEY $BITTREX_API_KEY
ENV BITTREX_API_SECRET $BITTREX_API_SECRET

WORKDIR /usr/app

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

FROM base as build
 
COPY . .

RUN npm run build