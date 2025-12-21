import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;

async function connectDB() {
  if (!mongoose.connection.readyState) {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB Connected Successfully');

      mongoose.connection.once('open', () =>
        console.log('🌐 Connected to MongoDB Atlas!')
      );

      mongoose.connection.on('error', (err) =>
        console.error('❌ MongoDB connection error:', err)
      );
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }
}

export default connectDB;
