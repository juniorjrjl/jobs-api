FROM node:18

RUN apt-get update && apt-get install -qq -y --no-install-recommends

RUN npm install -g npm@8.9.0

ENV INSTALL_PATH /jobs-api

RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY . .