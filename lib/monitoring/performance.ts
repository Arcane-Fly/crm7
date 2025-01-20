import { startTransaction } from './index'
import { logger } from '@/lib/services/logger'

export interface PerformanceMetrics {
  ttfb: number
  fcp: number
  lcp: number
  fid: number
  cls: number
}

export function trackWebVitals() {
  if (typeof window !== 'undefined') {
    try {
      const { onFCP, onTTFB, onLCP, onFID, onCLS } = require('web-vitals')

      onFCP((metric: any) => {
        logger.info('FCP:', { value: metric.value })
        setTag('fcp', String(metric.value))
      })

      onTTFB((metric: any) => {
        logger.info('TTFB:', { value: metric.value })
        setTag('ttfb', String(metric.value))
      })

      onLCP((metric: any) => {
        logger.info('LCP:', { value: metric.value })
        setTag('lcp', String(metric.value))
      })

      onFID((metric: any) => {
        logger.info('FID:', { value: metric.value })
        setTag('fid', String(metric.value))
      })

      onCLS((metric: any) => {
        logger.info('CLS:', { value: metric.value })
        setTag('cls', String(metric.value))
      })
    } catch (error) {
      logger.error('Failed to initialize web vitals', error as Error)
    }
  }
}

export function trackPageLoad(pageName: string) {
  const transaction = startTransaction(`page_load_${pageName}`, 'page-load')

  if (transaction) {
    window.addEventListener('load', () => {
      transaction.finish()
    })
  }
}

export function trackApiCall(endpoint: string) {
  return startTransaction(`api_call_${endpoint}`, 'api')
}

export function trackDatabaseQuery(query: string) {
  return startTransaction(`db_query_${query}`, 'db')
}
