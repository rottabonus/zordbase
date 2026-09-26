# build-backend
FROM node:24-alpine as backend

WORKDIR /app
COPY back/ .
RUN npm install && npm run build


# build-frontend
FROM node:24-alpine as frontend

WORKDIR /app
COPY front/ .
RUN npm install && npm run build 


# copy from builds
FROM node:24-alpine as prod 

EXPOSE 3000
USER node
WORKDIR /app

COPY --from=backend --chown=node:node /app/dist .
COPY --from=backend --chown=node:node /app/package.json .
COPY --from=backend --chown=node:node /app/node_modules node_modules
COPY --from=frontend --chown=node:node /app/www www
COPY --chown=node:node ./docker-entrypoint.sh .
COPY --chown=node:node ./writeHtml.cjs .

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
