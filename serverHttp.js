require("dotenv").config();
const app = require("./src/app");
const http = require("http");
const Constants = require("./src/constants/appConstants");

process.on("uncaughtException", (err) => {
  console.log(err);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
});

http.createServer(app).listen(Constants.PORT, () => {
  console.log("Server Started.");
});
