const mongoose = require("mongoose");
const { bootstrapAdminUser } = require("../utils/bootstrap");

const globalCache = global.__nouveauMongoose || { conn: null, promise: null, bootstrapped: false };

global.__nouveauMongoose = globalCache;

const connectToDatabase = async () => {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required");
    }

    globalCache.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then(async (connection) => {
        if (!globalCache.bootstrapped) {
          await bootstrapAdminUser();
          globalCache.bootstrapped = true;
        }
        return connection;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
};

module.exports = { connectToDatabase };
