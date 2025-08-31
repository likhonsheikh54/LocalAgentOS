const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Connect to CDP
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send("Network.enable");

  // Log requests (like an autonomous monitor)
  cdpSession.on("Network.requestWillBeSent", (event) => {
    console.log("Request:", event.request.url);
  });

  // Example: Autonomous task loop
  const tasks = [
    "https://example.com",
    "https://news.ycombinator.com",
    "https://github.com"
  ];

  for (const url of tasks) {
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    console.log(`Page title: ${title}`);
  }

  await browser.close();
})();
