import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@/lib/logger'

export type APIHandler<_T extends string> = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

export function monitorAPIEndpoint<_T extends string>(
  path: string,
  operation?: string,
  options?: {
    logRequest?: boolean
    logResponse?: boolean
  }
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      const [req, res] = args

      if (options?.logRequest) {
        logger.info(`API Request: ${path}`, {
          method: req.method,
          query: req.query,
          body: req.body,
        })
      }

      try {
        const result = await originalMethod.apply(this, args)

        const duration = Date.now() - startTime
        logger.info(`API Response: ${path}`, {
          duration,
          operation,
          status: res.statusCode,
        })

        if (options?.logResponse) {
          logger.info(`API Response Data: ${path}`, { result })
        }

        return result
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error(`API Error: ${path}`, {
          duration,
          operation,
          error,
        })
        throw error
      }
    }

    return descriptor
  }
}
