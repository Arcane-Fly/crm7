import { createClient } from '@/lib/supabase/client'

interface AwardRate {
  classification: string
  hourlyRate: number
  weeklyRate: number
  overtimeRate: number
  penaltyRates: Record<string, number>
  allowances: Record<string, number>
}

interface EnterpriseAgreement {
  id: string
  name: string
  document: string
  rates: AwardRate[]
  metadata: Record<string, any>
}

export class FairworkService {
  private apiKey: string
  private supabase = createClient()

  constructor() {
    this.apiKey = process.env.FAIRWORK_API_KEY_1!
  }

  async getAwardRates(awardCode: string, classification: string) {
    try {
      const response = await fetch(`https://api.fairwork.gov.au/v1/awards/${awardCode}/pay-rates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch award rates')

      const data = await response.json()
      return this.processAwardRates(data, classification)
    } catch (error) {
      console.error('Error fetching award rates:', error)
      throw error
    }
  }

  async uploadEnterpriseAgreement(file: File) {
    try {
      // Upload document to Supabase storage
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage
        .from('enterprise-agreements')
        .upload(`agreements/${file.name}`, file)

      if (uploadError) throw uploadError

      // Extract text from document
      const text = await this.extractTextFromDocument(file)

      // Process agreement text with AI
      const processedData = await this.processAgreementText(text)

      // Store agreement data
      const { error: dbError } = await this.supabase
        .from('enterprise_agreements')
        .insert({
          name: file.name,
          document_url: uploadData.path,
          rates: processedData.rates,
          metadata: processedData.metadata
        })

      if (dbError) throw dbError

      return processedData
    } catch (error) {
      console.error('Error processing enterprise agreement:', error)
      throw error
    }
  }

  private async extractTextFromDocument(file: File): Promise<string> {
    // TODO: Implement document text extraction
    // This could use PDF.js, docx, or other libraries depending on file type
    return ''
  }

  private async processAgreementText(text: string) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'pplx-7b-online',
          messages: [
            {
              role: 'system',
              content: 'Extract pay rates, classifications, and conditions from the enterprise agreement text.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1024,
          temperature: 0.1
        })
      })

      const data = await response.json()
      return this.parseAgreementResponse(data)
    } catch (error) {
      console.error('Error processing agreement text:', error)
      throw error
    }
  }

  private processAwardRates(data: any, classification: string): AwardRate {
    // Process and structure the award rates data
    return {
      classification,
      hourlyRate: 0,
      weeklyRate: 0,
      overtimeRate: 0,
      penaltyRates: {},
      allowances: {}
    }
  }

  private parseAgreementResponse(data: any): EnterpriseAgreement {
    // Parse and structure the AI response
    return {
      id: '',
      name: '',
      document: '',
      rates: [],
      metadata: {}
    }
  }
}
