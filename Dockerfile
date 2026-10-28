FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM build AS migration
ENV NODE_ENV=production
COPY sequelize.config.cjs .sequelizerc ./
COPY migrations ./migrations
USER node
CMD ["npm", "run", "migrate", "--", "--env", "production"]

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORTAPP=3002
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORTAPP+'/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
