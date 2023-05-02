FROM node:18-alpine AS development

# Define working directory
WORKDIR /app

# Build python dependencies
RUN apk add g++ make py3-pip

# Install dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN ["npm", "ci"]

# Copy assets
COPY . /app

ENV CI=true
ENV PORT=3000

CMD [ "npm", "start" ]

FROM development AS build

RUN npm run build

FROM nginx:alpine

# Copy build assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf