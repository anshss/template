FROM node:18

WORKDIR /app

# Copy Next.js app package files and install dependencies
COPY app/package*.json ./app/
WORKDIR /app/app
RUN npm install

# Copy Next.js application source and build
COPY app ./
RUN npm run build

# Set up monitoring service
WORKDIR /app/monitor
COPY monitor/package*.json ./
RUN npm install

COPY monitor/index.js ./

# Create start script
WORKDIR /app
RUN echo '#!/bin/sh\n\
cd /app/app && node server.js & \n\
cd /app/monitor && node index.js' > start.sh

RUN chmod +x start.sh

EXPOSE 3000 9100

CMD ["./start.sh"]