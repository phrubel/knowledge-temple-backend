require("dotenv").config();
const app = require("./src/app");
const Constants = require("./src/constants/appConstants");

// Start the server using Express' built-in .listen() method
app.listen(Constants.PORT, () => {
  console.log(`Server running on http://localhost:${Constants.PORT}`);
});

// Handle any uncaught exceptions or unhandled promise rejections
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1); // Exit the process after logging the error
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`Unhandled Rejection: ${reason}`);
  process.exit(1); // Exit the process after logging the error
});
