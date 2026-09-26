# build-backend
FROM node:24-alpine AS backend

WORKDIR /app
COPY back/ .
COPY words/ /words/
RUN npm ci && npm run build


# build-frontend
FROM node:24-alpine AS frontend

WORKDIR /app
COPY front/ .
RUN npm ci && npm run build 


# copy from builds
FROM node:24-alpine AS prod 

EXPOSE 3000
USER node
WORKDIR /app

COPY --from=backend --chown=node:node /app .
COPY --from=backend --chown=node:node /words/ /words
COPY --from=frontend --chown=node:node /app/dist www

CMD ["npm", "start"]
