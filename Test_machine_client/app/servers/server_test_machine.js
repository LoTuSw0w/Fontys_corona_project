//import NPM packages
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//define the routes from an external file
require(`../Routes/route.test_machine`)(app);

// set port, listen for requests
app.listen(5000, () => {
  console.log("Testing machine server is running on port 5000.");
});
 
//////////////////////
