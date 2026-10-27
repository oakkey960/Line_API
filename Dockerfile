FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM build AS migration
COPY sequelize.config.cjs .sequelizerc ./
COPY migrations ./migrations
USER node
CMD ["npm", "run", "migrate", "--", "--env", "production"]

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3002
CMD ["node", "dist/server.js"]
