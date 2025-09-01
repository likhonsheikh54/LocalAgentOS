# LocalAgentOS

This project demonstrates an AI agent system that leverages Docker Model Runner for local Large Language Model (LLM) inference and Playwright for web interaction.

## Features

- **Local LLM Inference:** Utilizes Docker Model Runner to run LLMs locally, eliminating the need for external API keys like OpenAI.
- **Web Automation:** Employs Playwright to navigate web pages, extract information, and interact with web content.
- **Autonomous Agent:** The `agent.js` script orchestrates web browsing and LLM interaction to perform predefined tasks using a functional approach.

## Requirements

- **Docker Desktop 4.40+:** Ensure Docker Desktop is installed and running.
- **Docker Model Runner Enabled:** In Docker Desktop settings, enable "Model Runner" (currently in Beta for macOS on Apple Silicon).
- **Apple Silicon Mac (for GPU acceleration):** Recommended for optimal performance with Docker Model Runner.

## Setup and Running the Project

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/likhonsheikh54/LocalAgentOS
    cd LocalAgentOS
    ```

2.  **Build and Start Services:**
    Use the provided `Makefile` to build the Docker images and start the services. This will bring up the `chrome` (Playwright browser), `model-runner` (LLM inference), and `agent` containers.

    ```bash
    make up
    ```

    This command will:
    - Build the `agent` Docker image.
    - Pull the `selenium/standalone-chrome` and `docker/dev-model-runner:beta` images.
    - Start all services in detached mode.
    - Wait for services to become healthy.

3.  **Verify Services (Optional):**
    You can check the status and health of the running services:

    ```bash
    make status
    ```

4.  **Run Tests (Optional):**
    To ensure everything is working correctly, run the tests using Vitest:

    ```bash
    npm test
    ```
    Or with UI:
    ```bash
    npm run test:ui
    ```
    For coverage report:
    ```bash
    npm run coverage
    ```

5.  **View Agent Logs:**
    To see the agent's activity, including web navigation and LLM interactions:

    ```bash
    make logs
    ```

## Agent Functionality

The `agent.js` script is designed with a functional approach, where individual functions handle specific responsibilities:

1.  **`initializeAgent(chromeUrl)`:** Connects to a headless Chrome instance via Playwright and sets up a CDP session for monitoring network requests.
2.  **`askLLM(prompt)`:** Communicates with the Docker Model Runner using the `MODEL_RUNNER_URL` environment variable. It sends a prompt to the LLM and returns the response.
3.  **`analyzeWebPage(page)`:** Extracts information from the current webpage (URL, title, content) and uses `askLLM` to get an analysis from the LLM.
4.  **`executeTask(page, task)`:** Orchestrates the execution of a given task. It first asks the LLM for a plan and then navigates to a URL if the task includes one, followed by a webpage analysis.
5.  **`runAgent()`:** The main function that initializes the agent, defines a list of tasks, and executes them sequentially.

### LLM Interaction Example

The `askLLM` function sends a POST request to the Docker Model Runner's OpenAI-compatible API endpoint (`/v1/completions`).

```javascript
async function askLLM(prompt) {
  try {
    const response = await axios.post(`${MODEL_RUNNER_URL}/v1/completions`, {
      model: "llama2", // Ensure this model is loaded in your Docker Model Runner
      prompt,
      max_tokens: 1000,
      temperature: 0.7
    });
    return response.data.choices[0].text;
  } catch (error) {
    console.error("Error communicating with Model Runner:", error.message);
    return undefined; // Using undefined for optional values as per coding standards
  }
}
```

The agent currently sends predefined prompts to the LLM and logs the responses, as per the clarified functionality.

## Development

-   **Development Mode:** To run services in the foreground for easier debugging:
    ```bash
    make dev
    ```
-   **Access Agent Shell:** To get a bash shell inside the agent container:
    ```bash
    make shell
    ```
-   **Clean Up:** To stop and remove all containers and volumes:
    ```bash
    make clean