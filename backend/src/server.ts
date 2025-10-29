import app from './app';
import { config } from './config';

const PORT = config.port;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🏠 Home: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();