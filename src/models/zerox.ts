import { zerox } from 'zerox/node-zerox/dist';
import {
  ZeroxArgs,
  ModelProvider as ZeroxModelProvider,
} from 'zerox/node-zerox/dist/types';
import { Usage } from '../types';
import { resolvePath } from '../utils/path';
import { ModelProvider } from './base';
import {
  calculateTokenCost,
  IMAGE_EXTRACTION_SYSTEM_PROMPT,
  JSON_EXTRACTION_SYSTEM_PROMPT,
  OCR_SYSTEM_PROMPT,
} from './shared';

export class ZeroxProvider extends ModelProvider {
  private zeroxArgs: Omit<ZeroxArgs, 'filePath'>;
  private apiKey: string;
  constructor(model: string) {
    super(model);

    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment');

    this.zeroxArgs = {
      credentials: {
        apiKey: this.apiKey,
      },
      modelProvider: ZeroxModelProvider.OPENROUTER,
      model: this.model.replace('zerox:', ''),
      correctOrientation: false,
      maxRetries: 3,
      prompt: OCR_SYSTEM_PROMPT,
    };
  }

  async extractFromText(
    text: string,
    schema: any,
    imageBase64s?: string[],
    imagePath?: string,
    ragData?: Record<string, any>,
  ): Promise<{
    text: string;
    json: Record<string, any>;
    usage: Usage;
  }> {
    const startTime = performance.now();

    const result = await zerox({
      ...this.zeroxArgs,
      filePath: resolvePath(imagePath),
      directImageExtraction: true,
      schema,
      extractionPrompt: [
        JSON_EXTRACTION_SYSTEM_PROMPT,
        ragData
          ? `Here are some similar bookings from the past years: \n${JSON.stringify(ragData)}`
          : '',
      ].join('\n\n'),
    });

    const endTime = performance.now();

    const inputCost = calculateTokenCost(this.model, 'input', result.inputTokens);
    const outputCost = calculateTokenCost(this.model, 'output', result.outputTokens);

    const usage = {
      duration: endTime - startTime,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      totalTokens: result.inputTokens + result.outputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };

    return {
      text: result.pages
        .map((page) => page.content || '')
        .filter(Boolean)
        .join('\n\n'),
      json: result.extracted,
      usage,
    };
  }

  async extractFromImage(
    imagePath: string,
    schema: any,
  ): Promise<{
    text: string;
    json: Record<string, unknown> | null;
    usage: Usage;
  }> {
    const startTime = performance.now();

    const result = await zerox({
      ...this.zeroxArgs,
      filePath: resolvePath(imagePath),
      directImageExtraction: true,
      schema,
      extractionPrompt: IMAGE_EXTRACTION_SYSTEM_PROMPT,
    });

    const endTime = performance.now();

    const inputCost = calculateTokenCost(this.model, 'input', result.inputTokens);
    const outputCost = calculateTokenCost(this.model, 'output', result.outputTokens);

    const usage = {
      duration: endTime - startTime,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      totalTokens: result.inputTokens + result.outputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
    return {
      text: result.pages
        .map((page) => page.content || '')
        .filter(Boolean)
        .join('\n\n'),
      json: result.extracted,
      usage,
    };
  }
}
