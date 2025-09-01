# About this Project

This is a multi-service AI agent system designed for browser automation. It uses Docker Compose to orchestrate the different components. The "big picture" involves an `agent` service that uses the `@playwright/mcp` (Multi-Component Proxy) pattern to control a headless `chrome` instance, guided by instructions from a `model-runner` service.

## Architecture

The system is composed of several services defined in [`docker-compose.yml`](docker-compose.yml:1):

-   **`agent`**: The core orchestration service. **Crucially, its behavior differs significantly between local development and the CI-built Docker image.**
    -   **Local Development (`docker-compose up`):** The `agent` service is built from the project root (`context: .`) using [`dockerfiles/almalinux/Dockerfile`](dockerfiles/almalinux/Dockerfile:1), which executes a simple Playwright example script, [`agent.js`](agent.js:1). This local setup *does not* utilize the MCP architecture.
    -   **CI/Production Build:** The `agent` Docker image is built from the `agent/` directory (`context: ./agent`) using [`agent/Dockerfile`](agent/Dockerfile:1). This image's entrypoint is a `@playwright/mcp` server configured by [`agent/mcp.json`](agent/mcp.json:1) (or potentially [`agent/mcp.json.new`](agent/mcp.json.new:1) if that's the active configuration). This is the intended, full-featured agent.
-   **`chrome`**: A standalone headless Chrome browser (`selenium/standalone-chrome`) that the agent connects to for automation tasks.
-   **`model-runner`**: A service that interfaces with large language models (e.g., OpenAI) to provide intelligence to the agent.
-   **`frontend`/`web`**: Two separate and similar Next.js applications for the user interface. [`frontend/package.json`](frontend/package.json:1) and [`web/package.json`](web/package.json:1) indicate their respective dependencies. The `frontend/Dockerfile` is currently empty, suggesting `web/` might be the primary frontend.

## Key Files & Configuration

-   [`docker-compose.yml`](docker-compose.yml:1): The single source of truth for the local development environment. It defines all services, their relationships, ports, and environment variables.
-   [`agent/mcp.json`](agent/mcp.json:1) / [`agent/mcp.json.new`](agent/mcp.json.new:1): These are critical configuration files for the production `agent` service. They define how the agent orchestrates its sub-components (like Playwright and `sequentialthinking`) via `stdio`. When adding new agent capabilities, you will likely need to modify these files. Note the existence of both `mcp.json` and `mcp.json.new` – clarify which is the active configuration if making changes.
-   [`Makefile`](Makefile:1): Provides convenient wrapper commands for Docker Compose, such as `make up`, `make logs`, `make shell`, and `make test`. Use these for common development tasks.

## Local Development Workflow

1.  Ensure you have an `OPENAI_API_KEY` set in your environment or in a `.env` file at the root of the project.
2.  Run `make up` or `docker compose up -d` to start all services. Use `make dev` for attached mode.
3.  The `agent` service depends on the `chrome` and `model-runner` services being healthy before it starts.
4.  Use `make logs` to tail logs and `make shell` to get a shell inside the `agent` container.
5.  To run tests, use `make test`. This verifies the health of Chrome, Model Runner, and Agent services.

## Important Conventions & Patterns

### Inconsistent Agent Behavior (Local vs. CI)

Be aware that the `agent` service runs different code in different environments. This is a major source of potential confusion.
-   **Local (`docker-compose.yml`):** Builds from the project root (`context: .`) using [`dockerfiles/almalinux/Dockerfile`](dockerfiles/almalinux/Dockerfile:1), which runs [`agent.js`](agent.js:1). This script is a simple Playwright example and does not use the MCP architecture.
-   **CI (`.github/workflows/publish-docker.yml`):** Builds from the agent directory (`context: ./agent`) using [`agent/Dockerfile`](agent/Dockerfile:1). This image's entrypoint is a `@playwright/mcp` server that is configured by [`agent/mcp.json`](agent/mcp.json:1).

### Agent Orchestration via MCP

The intended architecture for the agent uses `@playwright/mcp` to manage sub-processes. [`agent/mcp.json`](agent/mcp.json:1) (or [`agent/mcp.json.new`](agent/mcp.json.new:1)) configures these. For example, it can spawn another Docker container for a task and communicate with it over `stdio`. This is why the agent container mounts the Docker socket.

```json
// agent/mcp.json (example snippet)
"sequentialthinking": {
  "type": "stdio",
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "--network=host",
    "mcp/sequentialthinking"
  ],
  // ...
}
```

### Dual Frontend Applications

The repository contains two very similar Next.js applications in `frontend/` and `web/`. Before making UI changes, please clarify which application is the active target for development. The empty `frontend/Dockerfile` suggests `web/` might be the primary.

## CI/CD

Workflows in `.github/workflows/` handle automated publishing:
-   `publish-docker.yml`: Builds and pushes the `agent` Docker image (using [`agent/Dockerfile`](agent/Dockerfile:1)) to `ghcr.io` on new releases.
-   `publish-npm.yml`: Publishes the root of the project as a Node.js package to GitHub Packages on new releases.
