const cluster = require('cluster');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 3000;

// Use modern isPrimary or fallback to isMaster
const isPrimary = cluster.isPrimary !== undefined ? cluster.isPrimary : cluster.isMaster;

if (isPrimary) {
  console.log('====================================================');
  console.log(`🚀 Oxomsoft Software Solution Cluster Master`);
  console.log(`⚡ Master PID: ${process.pid}`);
  console.log(`💻 Detected ${numCPUs} CPU Core(s)`);
  console.log(`🌐 Target Domain: ${process.env.APP_DOMAIN || 'oxomsoft.in'}`);
  console.log(`🔌 Listening Port: ${PORT}`);
  console.log('====================================================');

  // Fork a worker for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`[Master] Spawned Worker #${i + 1} (PID: ${worker.process.pid})`);
  }

  // Handle worker exit & auto-respawn
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Master] ⚠️ Worker PID ${worker.process.pid} died (code: ${code}, signal: ${signal}). Respawning new worker...`);
    const newWorker = cluster.fork();
    console.log(`[Master] 🔄 New Worker spawned (PID: ${newWorker.process.pid})`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Master] Gracefully shutting down all cluster workers...');
    for (const id in cluster.workers) {
      if (cluster.workers[id]) {
        cluster.workers[id].kill('SIGTERM');
      }
    }
    setTimeout(() => {
      console.log('[Master] Exiting master process.');
      process.exit(0);
    }, 2000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

} else {
  // Worker process: Load Express application
  const app = require('./app');

  const server = app.listen(PORT, () => {
    console.log(`[Worker] Server active on port ${PORT} (PID: ${process.pid})`);
  });

  // Handle worker graceful termination
  process.on('SIGTERM', () => {
    console.log(`[Worker ${process.pid}] SIGTERM received. Closing HTTP server...`);
    server.close(() => {
      console.log(`[Worker ${process.pid}] Closed remaining connections.`);
      process.exit(0);
    });
  });
}
