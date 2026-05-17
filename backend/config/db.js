const mongoose = require("mongoose");
const { bootstrapAdminUser } = require("../utils/bootstrap");

mongoose.set("strictQuery", false);

const globalCache = global.__nouveauMongoose || { conn: null, promise: null, bootstrapped: false };

global.__nouveauMongoose = globalCache;

const getMongoUri = () => {
  return process.env.MONGODB_URI || process.env.MONGO_URI || "";
};

const connectToDatabase = async () => {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    const uri = getMongoUri();
    if (!uri) {
      throw new Error("MongoDB connection string is required (MONGODB_URI or MONGO_URI)");
    }

    console.log("[db] connecting to MongoDB", { uri: uri ? uri.slice(0, 32) + "..." : "<missing>" });

    globalCache.promise = mongoose
      .connect(uri)
      .then(async (connection) => {
        console.log("[db] MongoDB connected", {
          host: connection?.connection?.host,
          name: connection?.connection?.name,
          port: connection?.connection?.port,
        });
        if (!globalCache.bootstrapped) {
          await bootstrapAdminUser();
          globalCache.bootstrapped = true;
        }

        return connection;
      })
      .catch((error) => {
        globalCache.conn = null;
        globalCache.promise = null;
        globalCache.bootstrapped = false;
        console.error("[db] MongoDB connection failed", error);
        throw error;
      });
  }

  try {
    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
  } catch (error) {
    globalCache.conn = null;
    globalCache.promise = null;
    throw error;
  }
};

module.exports = { connectToDatabase };
