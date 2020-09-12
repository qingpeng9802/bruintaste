FROM node:14.10.0-alpine3.11
WORKDIR /usr/src/app/server
COPY package*.json ./
RUN npm ci
COPY . ./

ENV EXPRESS_PORT 5792
EXPOSE 5792

CMD ["npm", "start"]
