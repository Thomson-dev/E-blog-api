import { createClient } from 'redis';

const redisClient = createClient({
  url: 'rediss://red-cs79qtaj1k6c73cm54hg:L3KmfLHa7kKtTmcSuwQdJo3Pu31POLgV@oregon-redis.render.com:6379' ,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    connectTimeout: 10000, // 10 seconds
    keepAlive: 5000, // 5 seconds
  },
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Function to get a connected client
async function getConnectedClient() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

export { getConnectedClient };