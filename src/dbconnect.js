const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb+srv://23761a05m7_db_user:Rajesh@2004@travelmate.oiasxrg.mongodb.net/?retryWrites=true&w=majority&appName=Travelmate';
const MONGO_URI = process.env.DATABASE_URL || DEFAULT_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, MONGO_URI };
