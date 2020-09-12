FROM node:14.10.0-alpine3.11 AS builder
WORKDIR /usr/src/app/client
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run-script build

FROM nginx:1.18.0-alpine
WORKDIR /usr/src/app/
COPY --from=builder /usr/src/app/client/build/ /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

ENV PORT 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
