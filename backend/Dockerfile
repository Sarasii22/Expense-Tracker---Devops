# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port (matches your server.js)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]