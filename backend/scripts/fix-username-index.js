// Path: scripts/fix-username-index.js
// Run this script to remove the problematic username index

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fixUsernameIndex = async () => {
  try {
    const connection = await connectDB();
    
    // Get the users collection
    const usersCollection = connection.connection.db.collection('users');
    
    // List all indexes
    console.log('Current indexes:');
    const indexes = await usersCollection.indexes();
    console.log(indexes);
    
    // Drop the username index if it exists
    const usernameIndex = indexes.find(index => 
      index.key && index.key.username === 1 && index.unique === true
    );
    
    if (usernameIndex) {
      console.log('Found username index, dropping it...');
      await usersCollection.dropIndex('username_1');
      console.log('Username index dropped successfully');
    } else {
      console.log('No problematic username index found');
    }
    
    // Create a new sparse index if needed
    console.log('Creating new sparse index for username...');
    await usersCollection.createIndex({ username: 1 }, { 
      unique: true, 
      sparse: true 
    });
    console.log('New sparse index created successfully');
    
    // List all indexes again to confirm changes
    console.log('Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    console.log(updatedIndexes);
    
    console.log('Fix completed successfully');
  } catch (err) {
    console.error('Error fixing username index:', err);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the function
fixUsernameIndex();
// test