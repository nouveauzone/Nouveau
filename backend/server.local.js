const http = require("http");
const app = require("./server");
const { connectToDatabase } = require("./config/db");

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectToDatabase();
    http
      .createServer(app)
      .listen(port, "0.0.0.0", () => {
        console.log(`API listening on http://0.0.0.0:${port}`);
      });
  } catch (err) {
    console.error("Failed to start local server:", err);
    process.exit(1);
  }
};

start();
