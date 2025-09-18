# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build  # Assumes create-react-app; builds to /app/build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf  

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]