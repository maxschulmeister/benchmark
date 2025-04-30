import { JsonSchema, Usage } from '../types';

export class ModelProvider {
  model: string;
  extractionModel?: string;
  outputDir?: string;

  constructor(model: string, extractionModel?: string, outputDir?: string) {
    this.model = model;
    this.extractionModel = extractionModel;
    this.outputDir = outputDir;
  }

  async ocr(imagePath: string): Promise<{
    text: string;
    imageBase64s?: string[];
    usage: Usage;
  }> {
    throw new Error('Not implemented');
  }

  async extractFromText?(
    text: string,
    schema: JsonSchema,
    imageBase64s?: string[],
  ): Promise<{
    json: Record<string, any>;
    usage: Usage;
  }> {
    throw new Error('Not implemented');
  }

  async extractFromImage?(
    imagePath: string,
    schema: JsonSchema,
  ): Promise<{
    json: Record<string, any>;
    usage: Usage;
  }> {
    throw new Error('Not implemented');
  }
}
