FROM node:17-slim
LABEL org.opencontainers.image.authors="ZombyMediaIC"

EXPOSE 3000
EXPOSE 3443

## --------------------------- Install dependencies ---------------------------

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y curl nano git wget

RUN npm install -g npm
RUN npm install -g nodemon

## --------------------------- Setup ------------------------------------------

WORKDIR /app
COPY package.json /app
RUN npm install

COPY LICENSE /app
COPY README.md /app

COPY server /app
RUN touch /app/.env

## --------------------------- Run -------------------------------------------
CMD [ "npm", "start" ]