# ===============================
# BUILD STAGE
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

# copy dependency files first (cache layer)
COPY package*.json ./

# install deps
RUN npm install

# copy source code
COPY . .

# build # ===============================
# Build stage
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# copy source
COPY . .

# build frontend
RUN npm run build


# ===============================
# Production stage
# ===============================
FROM nginx:alpine

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

RUN npm run build


# ===============================
# PRODUCTION STAGE
# ===============================
FROM nginx:alpine

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy production build
COPY --from=build /app/dist /usr/share/nginx/html

# expose nginx port
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]
