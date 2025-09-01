import { chromium } from "playwright";
import axios from "axios";

const MODEL_RUNNER_URL = process.env.MODEL_RUNNER_URL || "http://localhost:8080";

async function initializeAgent(chromeUrl) {
  const browser = await chromium.connect({ wsEndpoint: chromeUrl });
  const context = await browser.newContext();
  const page = await context.newPage();

  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send("Network.enable");
  cdpSession.on("Network.requestWillBeSent", (event) => {
    console.log("Request:", event.request.url);
  });

  return { browser, context, page };
}

async function askLLM(prompt) {
  try {
    const response = await axios.post(`${MODEL_RUNNER_URL}/v1/completions`, {
      model: "llama2",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });
    return response.data.choices[0].text;
  } catch (error) {
    console.error("Error communicating with Model Runner:", error.message);
    return undefined; // Use undefined instead of null
  }
}

async function analyzeWebPage(page) {
  const url = await page.url();
  const title = await page.title();
  const content = await page.content();

  const prompt = `Analyze this webpage:
URL: ${url}
Title: ${title}
Content summary: ${content.substring(0, 1000)}...

Please provide:
1. Main topic or purpose
2. Key information or findings
3. Suggested next actions`;

  const analysis = await askLLM(prompt);
  return analysis;
}

async function executeTask(page, task) {
  console.log(`Executing task: ${task}`);

  const taskPlan = await askLLM(`How should I approach this task: ${task}`);
  console.log("Task plan:", taskPlan);

  if (task.includes("http")) {
    await page.goto(task, { waitUntil: "domcontentcontentloaded" });
    const analysis = await analyzeWebPage(page);
    console.log("Page analysis:", analysis);
  }
}

async function runAgent() {
  let browser;
  try {
    const { browser: initializedBrowser, page } = await initializeAgent(process.env.CHROME_URL);
    browser = initializedBrowser;

    const tasks = [
      "https://example.com",
      "Analyze the homepage content",
      "Look for contact information",
    ];

    for (const task of tasks) {
      await executeTask(page, task);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runAgent().catch(console.error);
