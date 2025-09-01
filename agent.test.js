import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chromium } from 'playwright';
import axios from 'axios';
import { initializeAgent, askLLM, analyzeWebPage, executeTask, runAgent } from './agent.js';

// Mock Playwright and Axios
vi.mock('playwright', () => ({
  chromium: {
    connect: vi.fn(() => ({
      newContext: vi.fn(() => ({
        newPage: vi.fn(() => ({
          url: vi.fn(() => 'https://example.com'),
          title: vi.fn(() => 'Example Domain'),
          content: vi.fn(() => '<html><body>Example Content</body></html>'),
          goto: vi.fn(),
        })),
        newCDPSession: vi.fn(() => ({
          send: vi.fn(),
          on: vi.fn(),
        })),
        close: vi.fn(),
      })),
      close: vi.fn(),
    })),
  },
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Agent Functions', () => {
  let mockBrowser, mockContext, mockPage;

  beforeEach(() => {
    mockPage = {
      url: vi.fn(() => 'https://example.com'),
      title: vi.fn(() => 'Example Domain'),
      content: vi.fn(() => '<html><body>Example Content</body></html>'),
      goto: vi.fn(),
    };
    mockContext = {
      newPage: vi.fn(() => mockPage),
      newCDPSession: vi.fn(() => ({
        send: vi.fn(),
        on: vi.fn(),
      })),
      close: vi.fn(),
    };
    mockBrowser = {
      newContext: vi.fn(() => mockContext),
      close: vi.fn(),
    };
    chromium.connect.mockResolvedValue(mockBrowser);
    axios.post.mockResolvedValue({ data: { choices: [{ text: 'LLM Response' }] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializeAgent should connect to browser and set up CDP session', async () => {
    const chromeUrl = 'ws://localhost:3000';
    const { browser, context, page } = await initializeAgent(chromeUrl);

    expect(chromium.connect).toHaveBeenCalledWith({ wsEndpoint: chromeUrl });
    expect(browser.newContext).toHaveBeenCalled();
    expect(context.newPage).toHaveBeenCalled();
    expect(context.newCDPSession).toHaveBeenCalledWith(page);
  });

  it('askLLM should send a POST request to the model runner and return text', async () => {
    const prompt = 'Test prompt';
    const response = await askLLM(prompt);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      model: 'llama2',
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });
    expect(response).toBe('LLM Response');
  });

  it('askLLM should return undefined on error', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    const prompt = 'Test prompt';
    const response = await askLLM(prompt);

    expect(response).toBeUndefined();
  });

  it('analyzeWebPage should call askLLM with correct prompt', async () => {
    const analysis = await analyzeWebPage(mockPage);

    expect(mockPage.url).toHaveBeenCalled();
    expect(mockPage.title).toHaveBeenCalled();
    expect(mockPage.content).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prompt: expect.stringContaining('Analyze this webpage:'),
    }));
    expect(analysis).toBe('LLM Response');
  });

  it('executeTask should call askLLM for task plan and navigate if URL is present', async () => {
    const task = 'https://example.com/test';
    await executeTask(mockPage, task);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prompt: expect.stringContaining('How should I approach this task:'),
    }));
    expect(mockPage.goto).toHaveBeenCalledWith(task, { waitUntil: 'domcontentcontentloaded' });
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prompt: expect.stringContaining('Analyze this webpage:'),
    }));
  });

  it('executeTask should call askLLM for task plan but not navigate if no URL', async () => {
    const task = 'Analyze this text';
    await executeTask(mockPage, task);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prompt: expect.stringContaining('How should I approach this task:'),
    }));
    expect(mockPage.goto).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prompt: expect.stringContaining('Analyze this webpage:'),
    }));
  });

  it('runAgent should execute all tasks and close the browser', async () => {
    process.env.CHROME_URL = 'ws://localhost:3000';
    await runAgent();

    expect(chromium.connect).toHaveBeenCalled();
    expect(mockPage.goto).toHaveBeenCalledTimes(1); // Only for the URL task
    expect(mockBrowser.close).toHaveBeenCalled();
  });
});