FROM node:8.12.0-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . ./migrations

# wait-for script permissions
RUN ["chmod", "+x", "/usr/app/migrations/wait-for"]

CMD [ "npm", "run", "migrate" ]
