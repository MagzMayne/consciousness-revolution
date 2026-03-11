FROM node:20-alpine

WORKDIR /app

# Copy entire conscious-network module (no external deps needed)
COPY . .

# Expose both API ports
EXPOSE 3100 3102

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV ACTION_SAFE_MODE=true
ENV COMMUNICATION_HTTP_PORT=3100
ENV LEARNING_HTTP_PORT=3102

# Run the all-in-one demo entrypoint (all 7 agents in one process)
CMD ["node", "demo/run-demo.js"]
