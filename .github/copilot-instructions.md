# About this Project

This is a multi-service AI agent system designed for browser automation. It uses Docker Compose to orchestrate the different components. The "big picture" involves an `agent` service that uses Playwright to control a headless `chrome` instance, guided by instructions from a `model-runner` service.

## Architecture

The system is composed of several services defined in `docker-compose.yml`:

-   **`agent`**: The core orchestration service written in Node.js. Its main logic is in `agent.js`. It acts as a client to the other services.
-   **`chrome`**: A standalone headless Chrome browser (`selenium/standalone-chrome`) that the agent connects to for automation tasks.
-   **`model-runner`**: A service that likely interfaces with large language models (e.g., OpenAI) to provide intelligence to the agent.
-   **`frontend`/`web`**: Two separate Next.js applications for the user interface.

## Key Files & Configuration

-   `docker-compose.yml`: The single source of truth for the local development environment. It defines all services, their relationships, ports, and environment variables.
-   `agent/mcp.json`: This is a critical configuration file for the `agent` service. It defines how the agent communicates with its sub-components (like Playwright) and other services. When adding new agent capabilities, you will likely need to modify this file.

    ```json
    "servers": {
      "playwright": {
        "type": "stdio",
        "command": "npx",
        "args": ["@playwright/mcp@latest"],
        "env": {
          "CHROME_URL": "ws://chrome:9222"
        }
      }
    }
    ```

## Local Development Workflow

1.  Ensure you have an `OPENAI_API_KEY` set in your environment or in a `.env` file at the root of the project.
2.  Run `docker-compose up` from the project root to start all services.
3.  The `agent` service depends on the `chrome` and `model-runner` services being healthy before it starts.

## Important Conventions & Patterns

### Inconsistent Docker Build Contexts

Be aware that the Docker build for the `agent` is inconsistent between local development and CI.
-   **Local (`docker-compose.yml`):** Builds from the project root (`context: .`) using `dockerfiles/almalinux/Dockerfile`.
-   **CI (`.github/workflows/publish-docker.yml`):** Builds from the agent directory (`context: ./agent`) using the `Dockerfile` within that directory.

### Dual Frontend Applications

The repository contains two very similar Next.js applications in `frontend/` and `web/`. Before making UI changes, please clarify which application is the active target for development.

## CI/CD

Workflows in `.github/workflows/` handle automated publishing:
-   `publish-docker.yml`: Builds and pushes the `agent` Docker image to `ghcr.io` on new releases.
-   `publish-npm.yml`: Publishes the root of the project as a Node.js package to GitHub Packages on new releases.
