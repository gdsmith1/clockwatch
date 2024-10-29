FROM node:20

COPY package*.json ./

RUN npm install

COPY *.js ./

CMD ["node", "index.js"]