import { createClient } from 'redis';

const client = createClient();

client.connect().catch((error) => {
  console.error('Failed to connect to Redis:', error);
});

export const redis = client;
