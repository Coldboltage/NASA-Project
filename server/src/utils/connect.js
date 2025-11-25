const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/testdb");
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.log(`Connection Error: ${error}`);
    process.exit(1);
  }

  mongoose.connection.once("disconnected", () => {
    console.log("MongoDB disconnected");
  });

  mongoose.connection.error("error", (error) => {
    console.error(`Error Emitted: ${error}`);
  });
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnect };
