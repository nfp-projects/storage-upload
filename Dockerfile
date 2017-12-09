FROM node:alpine

ARG NODE=development

ENV HOME=/app \
    NODE_ENV=${NODE}

COPY package.json $HOME/

WORKDIR $HOME

RUN npm install

COPY . $HOME/

EXPOSE 4020

CMD ["npm", "start"]
