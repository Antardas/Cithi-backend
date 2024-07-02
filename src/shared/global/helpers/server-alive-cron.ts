import { config } from '@/root/config';
import axios from 'axios';
import cron from 'node-cron';

const logger = config.createLogger('cron:server-alive');
function serverAliveCron() {
  logger.info('Logger Has Started');

  if (JSON.parse(config.SERVER_ALIVE_CORN) && config.USER_TOKEN) {
    cron.schedule('*/15 * * * *', async () => {
      try {
        const response = await axios.get('https://cithi-backend.onrender.com/api/v1/users/suggestions', {
          headers: {
            Authorization: config.USER_TOKEN
          }
        });
        logger.info(response.data?.message);
      } catch (error) {
        logger.error(error);
      }
    });
  } else {
    logger.info('cron is stopped');
  }
}

export { serverAliveCron };
