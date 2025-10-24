# Build Stage
FROM node:18-alpine AS build_image
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod

# Production Stage
FROM nginx:stable-alpine AS production
COPY --from=build_image /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



# #React app imagefile
# FROM node:current-bookworm

# # Prepare app directory
# WORKDIR /app/

# # Install dependencies
# COPY package*.json ./

# RUN npm install

# # Copy app files
# COPY . .

# EXPOSE 4000

# CMD ["npm", "start"]

