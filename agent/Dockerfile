# Use almalinux:minimal as the base image for a smaller footprint
FROM almalinux:minimal

# Install essential packages
RUN microdnf -y install \
    ca-certificates \
    curl \
    tar \
    gzip \
    git \
    xz \
    make \
    gcc \
    gcc-c++ \
    python3 \
    python3-pip \
    && microdnf -y clean all

# Install Node.js 18.x
ARG NODE_VERSION=18.18.0
RUN curl -O -L https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz && \
    tar -xJf node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 && \
    rm node-v${NODE_VERSION}-linux-x64.tar.xz && \
    npm install -g npm@latest

# Install Playwright and its dependencies
RUN npm init -y && \
    npm install @playwright/test && \
    npx playwright install-deps chromium

# Set up the working directory
WORKDIR /app

# Create data directory
RUN mkdir -p /app/data

# Copy configuration files
COPY mcp.json /app/mcp.json

# Install MCP dependencies
RUN npm install @playwright/mcp@latest

# Set environment variables
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright \
    CHROME_URL=ws://chrome:9222

# The default command will start the agent
CMD ["node", "-e", "require('@playwright/mcp').startServer()"]
