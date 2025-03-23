require("dotenv").config();
const app = require("./src/app");
const https = require("https");
const fs = require("fs");
const Constants = require("./src/constants/appConstants");

process.on("uncaughtException", (err) => {
  console.log("uncaughtException ==> ", err);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection ==> ", err);
});

const options = {
  key: fs.readFileSync(Constants.KEY_CER),
  cert: fs.readFileSync(Constants.CERT),
};

https.createServer(options, app).listen(Constants.PORT, () => {
  console.log("Server Started.", Constants.PORT);
});
