import { createClient, type RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  scripts: {},
});

client.connect().catch((error): void => {
  console.error('Failed to connect to Redis:', error);
});

export const redis: RedisClientType = client;
