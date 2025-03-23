require("dotenv").config();
const fs = require("fs");
const https = require("https");
const app = require("./src/app");
const Constants = require("./src/constants/appConstants");

const options = {
  key: fs.readFileSync("path/privatekey.pem"), // Update with actual path
  cert: fs.readFileSync("path/fullchain.pem"), // Update with actual path
};

https.createServer(options, app).listen(Constants.PORT, () => {
  console.log("HTTPS Server Started on port", Constants.PORT);
});
