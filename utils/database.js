const mongoose = require('mongoose');

let connectionPromise = null;

function getMongoUri() {
  return process.env.MONGODB_URI || (!process.env.VERCEL ? 'mongodb://localhost:27017/anubhuthi' : null);
}

async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = getMongoUri();
  if (!mongoUri) {
    const error = new Error('MONGODB_URI is not configured.');
    error.status = 503;
    throw error;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

module.exports = { ensureDatabaseConnected };
