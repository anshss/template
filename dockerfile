FROM node:18

# Copy Next.js app package files and install dependencies
WORKDIR /app
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
cd /app/app && npm run dev & \n\
cd /app/monitor && npm start' > start.sh

RUN chmod +x start.sh

EXPOSE 3000 9100

CMD ["./start.sh"]