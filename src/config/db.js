import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('Successfully connected to MongoDB');

    // Handle errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`Post-connection MongoDB error: ${err}`);
    });
  } catch (error) {
    console.error(
      `Critical Error: Could not connect to MongoDB. ${error.message}`,
    );
    process.exit(1);
  }
};

export default connectDB;
