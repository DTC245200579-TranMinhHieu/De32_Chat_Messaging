FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Biện pháp Hardening: Chạy app bằng user 'node' thay vì root
USER node
EXPOSE 3000
CMD ["node", "server.js"]