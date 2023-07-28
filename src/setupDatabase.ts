import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = (): void => {
    // TODO: change it before set into production hard-coded -> env
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
        log.info('Successfully Connected to the database');
      })
      .catch((error) => {
        log.error('Error Connecting  to database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
