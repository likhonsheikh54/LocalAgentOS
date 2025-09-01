import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface CompletionResponse {
  choices: Array<{
    text: string;
    index: number;
    finish_reason: string | null;
  }>;
}

interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
}

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

  async chatCompletion(
    model: string, 
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      this.logger.debug(`Sending chat completion request to model: ${model}`);
      const response = await this.axiosInstance.post<ChatCompletionResponse>(
        '/chat/completions',
        {
          model,
          messages,
          temperature: 0.7,
        }
      );
      
      this.logger.debug('Chat completion successful.');
      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('No completion content in response');
      }
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error during chat completion: ${error.message}`, error.stack);
        throw new Error(`Chat completion failed: ${error.message}`);
      }
      throw error;
    }
  }

  async createCompletion(
    model: string, 
    prompt: string, 
    options: { max_tokens?: number; temperature?: number } = {}
  ): Promise<string> {
    try {
      this.logger.debug(`Sending create completion request to model: ${model}`);
      const response = await this.axiosInstance.post<CompletionResponse>(
        '/completions',
        {
          model,
          prompt,
          max_tokens: options.max_tokens ?? 1000,
          temperature: options.temperature ?? 0.7,
        }
      );
      
      this.logger.debug('Create completion successful.');
      if (!response.data.choices?.[0]?.text) {
        throw new Error('No completion text in response');
      }
      return response.data.choices[0].text;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error during create completion: ${error.message}`, error.stack);
        throw new Error(`Text completion failed: ${error.message}`);
      }
      throw error;
    }
  }

  async createEmbeddings(model: string, input: string | string[]): Promise<number[][]> {
    try {
      this.logger.debug(`Sending create embeddings request to model: ${model}`);
      const response = await this.axiosInstance.post<EmbeddingResponse>(
        '/embeddings',
        {
          model,
          input,
        }
      );
      
      this.logger.debug('Create embeddings successful.');
      if (!response.data.data?.[0]?.embedding) {
        throw new Error('No embeddings in response');
      }
      return response.data.data.map(item => item.embedding);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error during create embeddings: ${error.message}`, error.stack);
        throw new Error(`Embedding generation failed: ${error.message}`);
      }
      throw error;
    }
  }
}
