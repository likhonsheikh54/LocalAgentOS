const { chromium } = require("playwright");
const axios = require("axios");

class Agent {
  constructor() {
    this.modelRunnerUrl = process.env.MODEL_RUNNER_URL || "http://localhost:8080";
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    // Connect to browser
    this.browser = await chromium.connect({ wsEndpoint: process.env.CHROME_URL });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    // Set up CDP session for monitoring
    const cdpSession = await this.context.newCDPSession(this.page);
    await cdpSession.send("Network.enable");
    cdpSession.on("Network.requestWillBeSent", (event) => {
      console.log("Request:", event.request.url);
    });
  }

  async askLLM(prompt) {
    try {
      const response = await axios.post(`${this.modelRunnerUrl}/v1/completions`, {
        model: "llama2", // or whatever model is loaded in Docker Model Runner
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

  async analyzeWebPage() {
    const url = await this.page.url();
    const title = await this.page.title();
    const content = await this.page.content();
    
    const prompt = `Analyze this webpage:
URL: ${url}
Title: ${title}
Content summary: ${content.substring(0, 1000)}...

Please provide:
1. Main topic or purpose
2. Key information or findings
3. Suggested next actions`;

    const analysis = await this.askLLM(prompt);
    return analysis;
  }

  async executeTask(task) {
    console.log(`Executing task: ${task}`);
    
    // Ask LLM how to approach the task
    const taskPlan = await this.askLLM(`How should I approach this task: ${task}`);
    console.log("Task plan:", taskPlan);

    // Navigate to relevant URL if present in the task
    if (task.includes("http")) {
      await this.page.goto(task, { waitUntil: "domcontentloaded" });
      const analysis = await this.analyzeWebPage();
      console.log("Page analysis:", analysis);
    }
  }

  async run() {
    await this.initialize();

    try {
      const tasks = [
        "https://example.com",
        "Analyze the homepage content",
        "Look for contact information"
      ];

      for (const task of tasks) {
        await this.executeTask(task);
      }
    } finally {
      await this.browser.close();
    }
  }
}

// Run the agent
const agent = new Agent();
agent.run().catch(console.error);
