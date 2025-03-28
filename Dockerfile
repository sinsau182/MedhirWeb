# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy Next.js project files
COPY . /app

# Ensure scripts have execution permissions
RUN chmod +x node_modules/.bin/next

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
