import { startServer } from './gateway/server.js';

startServer().catch((err) => {
  console.error('[tef-agent] fatal:', err);
  process.exit(1);
});
