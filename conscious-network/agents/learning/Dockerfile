FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3102
ENV NODE_ENV=production
ENV LEARNING_HTTP_PORT=3102
CMD ["node", "agents/learning/index.js"]
