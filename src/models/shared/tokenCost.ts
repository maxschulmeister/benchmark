import { FINETUNED_MODELS } from '../registry';

export const TOKEN_COST = (() => {
  const baseTokenCosts = {
    'azure-gpt-4o': {
      input: 2.5,
      output: 10,
    },
    'azure-gpt-4o-mini': {
      input: 0.15,
      output: 0.6,
    },
    'azure-gpt-4.1': {
      input: 2,
      output: 8,
    },
    'azure-gpt-4.1-mini': {
      input: 0.4,
      output: 1.6,
    },
    'azure-gpt-4.1-nano': {
      input: 0.1,
      output: 0.4,
    },
    'azure-o1': {
      input: 15,
      output: 60,
    },
    'azure-o1-mini': {
      input: 1.1,
      output: 4.4,
    },
    'azure-o3-mini': {
      input: 1.1,
      output: 4.4,
    },
    'claude-3-5-sonnet-20241022': {
      input: 3,
      output: 15,
    },
    'claude-3-7-sonnet-20250219': {
      input: 3,
      output: 15,
    },
    'deepseek-chat': {
      input: 0.14,
      output: 0.28,
    },
    'gemini-1.5-pro': {
      input: 1.25,
      output: 5,
    },
    'gemini-1.5-flash': {
      input: 0.075,
      output: 0.3,
    },
    'gemini-2.0-flash-001': {
      input: 0.1,
      output: 0.4,
    },
    'gemini-2.5-pro-exp-03-25': {
      input: 1.25,
      output: 10,
    },
    'gemini-2.5-pro-preview-03-25': {
      input: 1.25,
      output: 10,
    },
    'gemini-2.5-flash-preview-04-17': {
      input: 0.15,
      output: 0.6,
    },
    'gpt-4o': {
      input: 2.5,
      output: 10,
    },
    'gpt-4o-2024-11-20': {
      input: 2.5,
      output: 10,
    },
    'gpt-4o-mini': {
      input: 0.15,
      output: 0.6,
    },
    'gpt-4.1': {
      input: 2,
      output: 8,
    },
    'gpt-4.1-mini': {
      input: 0.4,
      output: 1.6,
    },
    'gpt-4.1-nano': {
      input: 0.1,
      output: 0.4,
    },
    o1: {
      input: 15,
      output: 60,
    },
    'o1-mini': {
      input: 1.1,
      output: 4.4,
    },
    'o3-mini': {
      input: 1.1,
      output: 4.4,
    },
    'o4-mini': {
      input: 1.1,
      output: 4.4,
    },
    'chatgpt-4o-latest': {
      input: 2.5,
      output: 10,
    },
    zerox: {
      input: 2.5,
      output: 10,
    },
    'qwen2.5-vl-32b-instruct': {
      input: 0, // TODO: Add cost
      output: 0, // TODO: Add cost
    },
    'qwen2.5-vl-72b-instruct': {
      input: 0, // TODO: Add cost
      output: 0, // TODO: Add cost
    },
    'google/gemma-3-27b-it': {
      input: 0.1,
      output: 0.2,
    },
    'deepseek/deepseek-chat-v3-0324': {
      input: 0.27,
      output: 1.1,
    },
    'meta-llama/llama-3.2-11b-vision-instruct': {
      input: 0.055,
      output: 0.055,
    },
    'meta-llama/llama-3.2-90b-vision-instruct': {
      input: 0.8,
      output: 1.6,
    },
    'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo': {
      input: 0.18,
      output: 0.18,
    },
    'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo': {
      input: 1.2,
      output: 1.2,
    },
    'meta-llama/Llama-4-Scout-17B-16E-Instruct': {
      input: 0.18,
      output: 0.59,
    },
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': {
      input: 0.27,
      output: 0.85,
    },
    'meta-llama/llama-4-maverick': {
      input: 0.17,
      output: 0.6,
    },
    'meta-llama/llama-4-scout': {
      input: 0.08,
      output: 0.3,
    },
    'openai/gpt-4.1': {
      input: 2,
      output: 8,
    },
    'openai/o4-mini-high': {
      input: 1.1,
      output: 4.4,
    },
    'google/gemini-2.5-pro-preview-03-25': {
      input: 1.25,
      output: 10,
    },
    'x-ai/grok-3-mini-beta': {
      input: 0.3,
      output: 0.5,
    },
    'google/gemini-2.0-flash-001': {
      input: 0.1,
      output: 0.4,
    },
    'google/gemini-2.5-flash-preview': {
      input: 0.15,
      output: 0.6,
    },
    'google/gemini-2.5-flash-preview:thinking': {
      input: 0.15,
      output: 3.5,
    },
    'openai/gpt-4o-2024-11-20': {
      input: 2.5,
      output: 10,
    },
    'tngtech/deepseek-r1t-chimera:free': {
      input: 0,
      output: 0,
    },
    'nvidia/llama-3.1-nemotron-ultra-253b-v1:free': {
      input: 0,
      output: 0,
    },
    'qwen/qwen3-235b-a22b': {
      input: 0.1,
      output: 0.1,
    },
    'microsoft/phi-4-reasoning-plus': {
      input: 0,
      output: 0,
    },
    'qwen/qwen3-14b': {
      input: 0.07,
      output: 0.24,
    },
    'qwen/qwen3-32b': {
      input: 0.1,
      output: 0.3,
    },
    'qwen/qwen2.5-vl-32b-instruct': {
      input: 0.9,
      output: 0.9,
    },
    'qwen/qwen2.5-vl-72b-instruct': {
      input: 0.25,
      output: 0.75,
    },
    'qwen/qwen-vl-plus': {
      input: 0.21,
      output: 0.63,
    },
    'qwen/qwen-vl-max': {
      input: 0.8,
      output: 3.2,
    },
    'opengvlab/internvl3-14b:free': {
      input: 0,
      output: 0,
    },
  };

  // Create a new object with both original keys and zerox-prefixed keys
  const result = { ...baseTokenCosts };

  // Add zerox-prefixed duplicates
  Object.entries(baseTokenCosts).forEach(([key, value]) => {
    result[`zerox:${key}`] = { ...value };
  });

  return result;
})();

export const calculateTokenCost = (
  model: string,
  type: 'input' | 'output',
  tokens: number,
): number => {
  const fineTuneCost = Object.fromEntries(
    FINETUNED_MODELS.map((el) => [el, { input: 3.75, output: 15.0 }]),
  );
  const combinedCost = { ...TOKEN_COST, ...fineTuneCost };
  const modelInfo = combinedCost[model];
  if (!modelInfo) throw new Error(`Model '${model}' is not supported.`);
  return (modelInfo[type] * tokens) / 1_000_000;
};
