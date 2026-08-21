import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';
import logger from './utils/logger.js';

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 8080;

// Connect Database and Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to start server: ${err.message}`);
  });