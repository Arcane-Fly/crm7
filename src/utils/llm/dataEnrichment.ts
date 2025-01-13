import { PERPLEXITY_MODELS } from './config';
import { callPerplexity } from './perplexity';
import type { LLMConfig } from './config';

export async function enrichAwardData(
  config: LLMConfig,
  awardText: string
): Promise<{
  summary: string;
  keyPoints: string[];
  classifications: Array<{
    level: string;
    description: string;
    requirements: string[];
  }>;
}> {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an expert in analyzing and interpreting Australian Modern Awards. Extract key information and provide structured insights.',
    },
    {
      role: 'user' as const,
      content: `Please analyze this award text and provide a summary, key points, and classification details:\n\n${awardText}`,
    },
  ];

  const { content } = await callPerplexity(config, messages);

  try {
    const enrichedData = JSON.parse(content);
    return enrichedData;
  } catch (error) {
    console.error('Error parsing enriched data:', error);
    throw new Error('Failed to parse enriched award data');
  }
}

export async function searchRelevantClauses(
  config: LLMConfig,
  query: string,
  awardText: string
): Promise<{
  relevantClauses: Array<{
    clause: string;
    relevance: number;
    explanation: string;
  }>;
}> {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an expert at finding and explaining relevant clauses in Australian Modern Awards.',
    },
    {
      role: 'user' as const,
      content: `Find clauses relevant to this query: "${query}"\n\nAward text:\n${awardText}`,
    },
  ];

  const { content } = await callPerplexity(config, messages);

  try {
    const searchResults = JSON.parse(content);
    return searchResults;
  } catch (error) {
    console.error('Error parsing search results:', error);
    throw new Error('Failed to parse relevant clauses');
  }
}