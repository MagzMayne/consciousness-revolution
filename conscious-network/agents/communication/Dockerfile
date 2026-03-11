FROM node:20-alpine

WORKDIR /app

# Copy the entire conscious-network module
COPY . .

# No npm install needed — zero production dependencies

EXPOSE 3100

ENV NODE_ENV=production
ENV COMMUNICATION_HTTP_PORT=3100

CMD ["node", "agents/communication/index.js"]
