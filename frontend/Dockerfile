#app server nginx or similar can be used in production
FROM node:20-alpine


WORKDIR /app

#better caching
COPY package*.json ./

# dependencies
RUN npm install


COPY . .


EXPOSE 5173


CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
