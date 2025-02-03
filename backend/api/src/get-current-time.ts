export class ExtendedError extends Error {
  constructor(message: string, public readonly requestId?: string) {
    super(message);
    this.name = 'ExtendedError';
  }
}

export async function handler(req: Request, res: Response): Promise<void> {
  const requestId = crypto.randomUUID();
  
  try {
    res.status(200).json({
      currentTime: Date.now(),
      requestId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const extendedError = new ExtendedError(errorMessage, requestId);
    
    res.status(500).json({
      error: extendedError.message,
      requestId: extendedError.requestId
    });
  }
}
