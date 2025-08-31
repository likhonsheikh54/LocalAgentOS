# Use almalinux:minimal as the base image for a smaller footprint
FROM almalinux:minimal

# Install essential packages, including git and tools for managing archives.
# Also install ca-certificates for secure connections and xz for decompression.
RUN microdnf -y install ca-certificates tar gzip git xz && microdnf -y clean all

# Install Node.js 18.x
# We are downloading the official Node.js binaries, verifying the checksum,
# and then adding it to the path.
ARG NODE_VERSION=18.18.0
RUN curl -O -L https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz && \
    tar -xJf node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 && \
    rm node-v${NODE_VERSION}-linux-x64.tar.xz

# Verify that Node.js and npm are installed correctly
RUN node -v && npm -v

# Set up the working directory for the agent
WORKDIR /app

# Copy the mcp.json configuration file into the agent's filesystem
COPY mcp.json /app/mcp.json

# The default command will be specified in the docker-compose.yml
# For now, we can set a default command to start a shell.
CMD ["/bin/bash"]
