const mysql = require("mysql");
const HexdbConfig = require("../config/hex_db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
  host: HexdbConfig.HOST,
  user: HexdbConfig.USER,
  password: HexdbConfig.PASSWORD,
  database: HexdbConfig.DB
});

// connecting to MySQL
connection.connect(error => {
  if (error) throw error;
});

module.exports = connection;