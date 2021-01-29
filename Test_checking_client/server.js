const express = require("express");
const bodyParser = require("body-parser");
const databaseConnection = require("./app/models/db.js");

const app = express();

//parse requests as json
app.use(bodyParser.json());

//encode URL
app.use(bodyParser.urlencoded({ extended: true }));

require(`./app/Routes/routes`)(app);

// set port, listen for requests
app.listen(2000, () => {
  console.log("Server is running on port 2000.");
});
