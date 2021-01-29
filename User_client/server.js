const express = require('express');
const bodyParser = require('body-parser');
const databaseConnection = require('./app/models/db.js');
const hexDatabaseConnection = require('./app/models/hex_db.js');

const app = express();


//parse requests as json
app.use(bodyParser.json());

//encode URL 
app.use(bodyParser.urlencoded({extended: true}));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Fontys Corona Application" });
  });
  
require(`./app/routes/user.routes`)(app);
  
// set port, listen for requests
app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});


