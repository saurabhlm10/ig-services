import mongoose from 'mongoose';
import { ENV } from '../constants';

let connection: typeof mongoose | null = null;

const { mongoUri } = ENV;
export const connectToDB = async () => {
    try {
        if (!connection) {
            connection = await mongoose.connect(mongoUri);
        }
        console.log('Connected to db at', connection.connection.host);
        return connection;
    } catch (error) {
        console.log('cannot connect to db', error);
        throw new Error('cannot connect to db');
    }
};
