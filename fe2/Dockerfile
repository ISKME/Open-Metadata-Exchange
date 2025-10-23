#React app imagefile
FROM node:current-bookworm

# Prepare app directory
WORKDIR /app/

# Install dependencies
COPY package*.json ./

RUN npm install

# Copy app files
COPY . .

EXPOSE 4000

CMD ["npm", "start"]

