# LocalAgentOS

This project demonstrates an AI agent system that leverages Docker Model Runner for local Large Language Model (LLM) inference and Playwright for web interaction.

## Features

- **Local LLM Inference:** Utilizes Docker Model Runner to run LLMs locally, eliminating the need for external API keys like OpenAI.
- **Web Automation:** Employs Playwright to navigate web pages, extract information, and interact with web content.
- **Autonomous Agent:** The `agent.js` script orchestrates web browsing and LLM interaction to perform predefined tasks.

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
    To ensure everything is working correctly, run the integration tests:

    ```bash
    make test
    ```

5.  **View Agent Logs:**
    To see the agent's activity, including web navigation and LLM interactions:

    ```bash
    make logs
    ```

## Agent Functionality

The `agent.js` script is designed to:

1.  **Initialize Browser:** Connects to a headless Chrome instance via Playwright.
2.  **Monitor Network:** Sets up a CDP session to log network requests.
3.  **Interact with LLM:** Uses the `MODEL_RUNNER_URL` environment variable to communicate with the Docker Model Runner. It sends predefined prompts to the LLM and logs the responses.
4.  **Execute Tasks:** The agent has a list of tasks, which can include navigating to URLs or performing analysis. When a task involves an LLM, it sends a prompt and processes the LLM's response.

### LLM Interaction Example

The `agent.js` includes an `askLLM` function that sends a POST request to the Docker Model Runner's OpenAI-compatible API endpoint (`/v1/completions`).

```javascript
async askLLM(prompt) {
  try {
    const response = await axios.post(`${this.modelRunnerUrl}/v1/completions`, {
      model: "llama2", // Ensure this model is loaded in your Docker Model Runner
      prompt,
      max_tokens: 1000,
      temperature: 0.7
    });
    return response.data.choices[0].text;
  } catch (error) {
    console.error("Error communicating with Model Runner:", error.message);
    return null;
  }
}
```

The agent currently sends a predefined prompt to the LLM and logs the response, as per the clarified functionality.

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