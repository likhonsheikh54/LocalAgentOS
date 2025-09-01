import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DMRService {
  private readonly logger = new Logger(DMRService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly dmrBaseUrl: string;

  constructor() {
    this.dmrBaseUrl = process.env.DOCKER_MODEL_RUNNER_BASE_URL || 'http://localhost:12434';
    this.axiosInstance = axios.create({
      baseURL: `${this.dmrBaseUrl}/engines/llama.cpp/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.logger.log(`DMRService initialized with base URL: ${this.dmrBaseUrl}`);
  }

  async chatCompletion(model: string, messages: { role: string; content: string }[]): Promise<any> {
    try {
      this.logger.debug(`Sending chat completion request to model: ${model}`);
      const response = await this.axiosInstance.post('/chat/completions', {
        model,
        messages,
      });
      this.logger.debug('Chat completion successful.');
      return response.data;
    } catch (error: any) { // Explicitly type error as 'any' or 'AxiosError'
      this.logger.error(`Error during chat completion: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createCompletion(model: string, prompt: string, options?: any): Promise<any> {
    try {
      this.logger.debug(`Sending create completion request to model: ${model}`);
      const response = await this.axiosInstance.post('/completions', {
        model,
        prompt,
        ...options,
      });
      this.logger.debug('Create completion successful.');
      return response.data;
    } catch (error: any) { // Explicitly type error as 'any' or 'AxiosError'
      this.logger.error(`Error during create completion: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createEmbeddings(model: string, input: string | string[]): Promise<any> {
    try {
      this.logger.debug(`Sending create embeddings request to model: ${model}`);
      const response = await this.axiosInstance.post('/embeddings', {
        model,
        input,
      });
      this.logger.debug('Create embeddings successful.');
      return response.data;
    } catch (error: any) { // Explicitly type error as 'any' or 'AxiosError'
      this.logger.error(`Error during create embeddings: ${error.message}`, error.stack);
      throw error;
    }
  }
}