FROM node:20

COPY package*.json ./

RUN npm install

COPY index.js ./

CMD ["node", "index.js"]