FROM node:24-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY tsconfig.json ./
COPY src/ ./src/


# Use tsx for better TypeScript support
ENTRYPOINT ["pnpm", "run", "dev" ]
