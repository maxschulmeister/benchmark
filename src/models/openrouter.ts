import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { Usage } from '../types';
import { encodeImageToBase64 } from '../utils/file';
import { resolvePath } from '../utils/path';
import { convertToOpenAIStrictSchema } from '../utils/schema';
import { ModelProvider } from './base';
import {
  calculateTokenCost,
  IMAGE_EXTRACTION_SYSTEM_PROMPT,
  JSON_EXTRACTION_SYSTEM_PROMPT,
  OCR_SYSTEM_PROMPT,
} from './shared';

export class OpenRouterProvider extends ModelProvider {
  private client: OpenAI;

  constructor(model: string) {
    super(model);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Missing required OpenRouter API key');
    }

    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.SITE_URL || 'https://github.com/omni-ai/benchmark',
        'X-Title': 'OmniAI OCR Benchmark',
      },
    });
  }

  async ocr(imagePath: string): Promise<{
    text: string;
    imageBase64s?: string[];
    usage: Usage;
  }> {
    const start = performance.now();

    const image = imagePath.startsWith('http')
      ? imagePath
      : await encodeImageToBase64(resolvePath(imagePath));

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: OCR_SYSTEM_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: image,
            },
          },
        ],
      },
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
    });

    const end = performance.now();

    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const inputCost = calculateTokenCost(this.model, 'input', inputTokens);
    const outputCost = calculateTokenCost(this.model, 'output', outputTokens);

    return {
      text: response.choices[0].message.content || '',
      usage: {
        duration: end - start,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
      },
    };
  }

  async extractFromText(
    text: string,
    schema: any,
    imageBase64s?: string[],
  ): Promise<{
    json: Record<string, any>;
    usage: Usage;
  }> {
    const start = performance.now();

    let imageMessages = [];
    if (imageBase64s && imageBase64s?.length > 0) {
      imageMessages = imageBase64s.map((base64) => ({
        type: 'image_url' as const,
        image_url: { url: base64 },
      }));
    }
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: JSON_EXTRACTION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [{ type: 'text', text } as const, ...imageMessages],
      },
    ];

    const strictSchema = convertToOpenAIStrictSchema(schema);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extraction',
          strict: true,
          schema: strictSchema,
        },
      },
    });

    const end = performance.now();
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const inputCost = calculateTokenCost(this.model, 'input', inputTokens);
    const outputCost = calculateTokenCost(this.model, 'output', outputTokens);
    let json;
    try {
      json = JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      json = response.choices[0].message.content || '';
    }
    return {
      json,
      usage: {
        duration: end - start,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
      },
    };
  }

  async extractFromImage(
    imagePath: string,
    schema: any,
  ): Promise<{
    json: Record<string, any>;
    usage: Usage;
  }> {
    const start = performance.now();
    const image = imagePath.startsWith('http')
      ? imagePath
      : await encodeImageToBase64(resolvePath(imagePath));
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: OCR_SYSTEM_PROMPT + '\n\n' + IMAGE_EXTRACTION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url' as const,
            image_url: {
              url: image,
            },
          },
        ],
      },
    ];

    const strictSchema = convertToOpenAIStrictSchema(schema);
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extraction',
          strict: true,
          schema: strictSchema,
        },
      },
    });

    console.log(response);
    const end = performance.now();
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const inputCost = calculateTokenCost(this.model, 'input', inputTokens);
    const outputCost = calculateTokenCost(this.model, 'output', outputTokens);
    let json;
    try {
      json = JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      json = response.choices[0].message.content || '';
    }
    return {
      json,
      usage: {
        duration: end - start,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
      },
    };
  }
}
