# Base image for building the project
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy the local files to the container
COPY . .

# Install dependencies...
RUN npm install


# Run the build process
RUN npm run build

# Production stage: Copy build artifacts and prepare for production
FROM node:20
WORKDIR /app

# Copy the build artifacts from the build stage
COPY --from=build /app .

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
