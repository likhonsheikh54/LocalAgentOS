FROM almalinux:8

# Install EPEL and necessary packages
RUN dnf -y install epel-release && \
    dnf -y update && \
    dnf -y install \
    nodejs \
    npm \
    git \
    curl \
    make \
    gcc-c++ \
    python3 \
    python3-pip \
    jq \
    && dnf clean all

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production \
    CHROME_URL=ws://chrome:9222 \
    MODEL_RUNNER_URL=http://model-runner:8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(process.uptime() > 30 ? 0 : 1)"

# Start the agent
CMD ["node", "agent.js"]
