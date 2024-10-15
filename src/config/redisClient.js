import { createClient } from 'redis';

const redisClient = createClient({
  url: 'rediss://red-cs79qtaj1k6c73cm54hg:L3KmfLHa7kKtTmcSuwQdJo3Pu31POLgV@oregon-redis.render.com:6379'  // Replace with your Redis server URL if different
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