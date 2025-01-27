import { Together } from '@/lib/api/together';
import { createClient } from '@/lib/supabase/client';

interface EnrichmentOptions {
  model?: 'deepseek-ai/DeepSeek-V3' | 'pplx-7b-online';
  temperature?: number;
  maxTokens?: number;
}

export class DataEnrichmentService {
  private together: Together;
  private supabase = createClient();

  constructor() {
    this.together = new Together(process.env.TOGETHER_API_KEY!);
  }

  async enrichFromWebsite(url: string, options: EnrichmentOptions = {}) {
    try {
      // Fetch website content
      const response = await fetch(url);
      const html = await response.text();

      // Extract text content (basic implementation)
      const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Use Together AI to analyze
      const enrichedData = await this.together.chat.completions.create({
        model: options.model || 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'system',
            content:
              'Extract key information from the following text. Focus on company details, qualifications, training programs, and industry-specific information.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 1000,
      });

      return enrichedData;
    } catch (error) {
      console.error('Enrichment error:', error);
      throw error;
    }
  }

  async enrichWithPerplexity(query: string) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'pplx-7b-online',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in vocational education and training. Extract and analyze relevant information.',
            },
            {
              role: 'user',
              content: query,
            },
          ],
          max_tokens: 1024,
          temperature: 0.1,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }

  async enrichApprenticeData(apprenticeId: string) {
    try {
      // Fetch apprentice data
      const { data: apprentice, error } = await this.supabase
        .from('apprentices')
        .select('*')
        .eq('id', apprenticeId)
        .single();

      if (error) throw error;

      // Enrich with industry insights
      const industryInsights = await this.enrichWithPerplexity(
        `Provide insights about career progression and skill requirements for ${apprentice.qualification} in ${apprentice.industry}`,
      );

      // Update apprentice record with enriched data
      const { error: updateError } = await this.supabase
        .from('apprentices')
        .update({
          enriched_data: {
            industry_insights: industryInsights.choices[0].message.content,
            last_updated: new Date().toISOString(),
          },
        })
        .eq('id', apprenticeId);

      if (updateError) throw updateError;

      return industryInsights;
    } catch (error) {
      console.error('Apprentice enrichment error:', error);
      throw error;
    }
  }

  async enrichQualificationData(qualificationId: string) {
    try {
      // Fetch qualification data
      const { data: qualification, error } = await this.supabase
        .from('qualifications')
        .select('*')
        .eq('id', qualificationId)
        .single();

      if (error) throw error;

      // Enrich with market data and requirements
      const marketData = await this.enrichWithPerplexity(
        `Analyze market demand, salary ranges, and industry requirements for ${qualification.title}`,
      );

      // Update qualification with enriched data
      const { error: updateError } = await this.supabase
        .from('qualifications')
        .update({
          market_data: {
            insights: marketData.choices[0].message.content,
            last_updated: new Date().toISOString(),
          },
        })
        .eq('id', qualificationId);

      if (updateError) throw updateError;

      return marketData;
    } catch (error) {
      console.error('Qualification enrichment error:', error);
      throw error;
    }
  }
}
