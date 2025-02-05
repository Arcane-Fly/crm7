// Replace the current implementation with:
export async function handler(req: Request, res: Response): Promise<void> {
  const requestId = crypto.randomUUID();
  try {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      currentTime: Date.now(),
      requestId
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      requestId
    }));
  }
}
