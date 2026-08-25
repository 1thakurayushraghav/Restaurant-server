const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Shree Munnalal server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
