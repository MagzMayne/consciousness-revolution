FROM node:20-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
# Default: safe mode ON. Set ACTION_SAFE_MODE=false to enable real-world actions.
ENV ACTION_SAFE_MODE=true
CMD ["node", "agents/action/index.js"]
