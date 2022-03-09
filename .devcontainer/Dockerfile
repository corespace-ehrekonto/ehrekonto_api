FROM node:17-stretch
LABEL authors="AsP3X"
LABEL description="Development environment for projects"

RUN apt-get update && apt-get upgrade -y

# install node js and npm with apk
RUN npm install -g npm@8.3.1
RUN npm install -g prettier

# install extra packages
RUN apt-get install -y vim git curl wget tar