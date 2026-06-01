FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose Expo ports
EXPOSE 8081 19000 19001

# Run Expo with LAN (works better in Docker, still allows QR)
CMD ["npx", "expo", "start", "-c", "--tunnel"]
