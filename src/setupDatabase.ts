import mongoose from 'mongoose';
import { config } from './config';

export default () => {
	const connect = (): void => {
		// TODO: change it before set into production hard-coded -> env
		mongoose
			.connect(config.DATABASE_URL!)
			.then(() => {
				console.log('Successfully Connected to the database');
			})
			.catch((error) => {
				console.log('Error Connecting  to database', error);
				return process.exit(1);
			});
	};
	connect();

	mongoose.connection.on('disconnected', connect);
};
