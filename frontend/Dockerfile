#app server nginx or similar can be used in production
FROM node:20-alpine

WORKDIR /app

#better caching
COPY package*.json ./

# dependencies
RUN npm install

COPY . .

# Fix permissions for OpenShift - allow any user to write (OpenShift uses random UIDs)
RUN chmod -R 777 /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
