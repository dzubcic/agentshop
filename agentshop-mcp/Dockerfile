FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build the project
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/build ./build

# The MCP server communicates via stdio
ENTRYPOINT ["node", "build/index.js"]
