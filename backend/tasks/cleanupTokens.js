const cron = require('node-cron');
const BlacklistedToken = require('../models/BlacklistedTokenModel');

// Schedule cleanup task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Starting token cleanup...');
    const result = await BlacklistedToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Token cleanup completed. Removed ${result.deletedCount} tokens.`);
  } catch (error) {
    console.error('Error during token cleanup:', error);
  }
});
