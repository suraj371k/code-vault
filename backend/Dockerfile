FROM node:20-alpine

LABEL maintainer="suraj kushwaha <surajkushwaha371@gmail.com>"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
