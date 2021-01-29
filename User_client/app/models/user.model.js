const sql = require("./db.js");
const sql_hex_database = require("./hex_db.js");
const sqlStatement = require("./sql_statement.model.js");

//constructor for the model
const User = function (user) {
  this.user_name = user.user_name;
  this.password = user.password;
  this.email = user.email;
  this.first_name = user.first_name;
  this.last_name = user.last_name;
};

////////////
//Note: For this model, the 'result' parameter will be used as a call-back function by the corresponding controller
////////////

//create new User model
User.create = (newUser, result) => {
  const statement = sqlStatement.insert_user_statement([
    `${newUser.user_name}`,
    `${newUser.password}`,
    `${newUser.email}`,
    `${newUser.first_name}`,
    `${newUser.last_name}`,
  ]);
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("there is an error: ", err);
      result(err, null);
      return;
    }
    //...is 'rest' parameter in ES6, in other words, show the rest of the array
    console.log("created a new user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

//find User by ID
User.findById = (userID, result) => {
  const statement = sqlStatement.select_all_statement(
    "User",
    "user_id",
    `${userID}`
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("there is an error: ", err);
      result(err, null);
      return;
    }
    //if there is a response, print out the id, which is the first element of the array
    if (res.length != 0) {
      console.log("found the user: ", res);
      result(null, res[0]);
      return;
    } else {
      console.log("no user found!");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

//find User by username
User.findbyUserName = (user_name, result) => {
  const statement = sqlStatement.select_all_statement(
    "User",
    "user_name",
    `${user_name}`
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("there is an error: ", err);
      result(err, null);
      return;
    }
    //if there is a response, print out the id, which is the first element of the array
    if (res.length != 0) {
      console.log("found the username: ", res);
      result(null, res[0]);
      return;
    } else {
      console.log("no user found!");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

//update an user (general)
User.updateAll = (id, user, result) => {
  const statement = sqlStatement.update_user(
    `${user.user_name}`,
    `${user.email}`,
    `${user.first_name}`,
    `${user.last_name}`,
    id
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("There is an error: ", err);
      result(err, null);
      return;
    }
    //if no row affected (no user matched with Id)
    if (res.affectedRows == 0) {
      result({ info: "not_found" }, null);
      return;
    }

    //conclusion
    console.log("the user updated: ", { id: id, ...user });
    result(null, { id: id, ...user });
  });
};

//get username and password for sign-in
User.getUsernameAndPassword = (username, result) => {
  const statement = sqlStatement.select_from_where_statement(
    [`user_name`, `password`],
    "User",
    "user_name",
    `${username}`
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("there is an error: ", err);
      result(err, null);
      return;
    }
    //if there is a response, print out the id, which is the first element of the array
    if (res.length != 0) {
      console.log("found user_name and pwd: ", res);
      result(null, res[0]);
      return;
    } else {
      console.log("no user found");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

User.linkUserToTest = (username, testLinkingCode, result) => {
  //first, select the user_id that matches the username
  const getUserIdStatement = sqlStatement.select_from_where_statement(
    "user_id",
    "User",
    "user_name",
    `${username}`
  );
  console.log(getUserIdStatement);
  sql.query(getUserIdStatement, (err, res) => {
    if (err) {
      console.log("error getting the user_id: ", err);
      result(err, null);
      return;
    }
    //else, get the response data and put it in another query for inserting
    if (res.length !== 0) {
      const idUser = res[0].user_id;
      //update the column in Test_instance that has matching test_link_code with the parameter
      const updateStatement = sqlStatement.update_set_where_statement(
        "Test_instance",
        "user_id",
        `${idUser}`,
        "test_link_code",
        `${testLinkingCode}`
      );
      console.log(updateStatement);
      sql.query(updateStatement, (err, res) => {
        if (err) {
          console.log("error inserting user_id", err);
          result(err, null);
          return;
        }
        if (res.affectedRows === 0) {
          result({ info: "no_row_affected" }, null);
          return;
        }
        //return if there is no error
        console.log("success!");
        result(null, {
          message: `successfully linked test result and user - ${username}`,
        });
        return;
      });
    } else {
      console.log("no user found");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

//Check if an User has 2FA enabled or not
User.check2AuthStatus = (username, result) => {
  //first, use a query to check for the boolean value '2auth_enabled'
  // `SELECT two_auth_enabled from User where user_name = '${username}';`
  const statement = sqlStatement.select_from_where_statement(
    "two_auth_enabled",
    "User",
    "user_name",
    `${username}`
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("error getting the two_auth_enabled value: ", err);
      result(err, null);
      return;
    }
    if (res.length !== 0) {
      const authValue = res[0].two_auth_enabled + "";
      result(null, authValue);
      return;
    } else {
      console.log("no user_name found! (model)");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

//change the two_auth_enabled value to true
User.change2AuthValueToTrue = (username, result) => {
  //call the query to change the value in the database
  // `UPDATE User SET two_auth_enabled = 1 WHERE user_name = '${username}';`
  const statement = sqlStatement.update_set_where_statement(
    "User",
    "two_auth_enabled",
    1,
    "user_name",
    `${username}`
  );
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("error updating the 2AF result", err);
      result(err, null);
      return;
    } else {
      console.log("finished updating user value 2af in the database");
      result(null, { info: "finished!" });
      return;
    }
  });
};

//update hex value stored in another database schema
User.UpdateHexValue = (username, hexvalue, result) => {
  //call the query to change the value in the database
  const statement = sqlStatement.update_set_where_statement(
    "user_hex_value",
    "hex_value",
    `${hexvalue}`,
    "user_name",
    `${username}`
  );
  sql_hex_database.query(statement, (err, res) => {
    if (err) {
      console.log("error updating the hex value", err);
      result(err, null);
      return;
    } else {
      console.log("finished updating hex value in the database");
      result(null, { info: "finished!" });
      return;
    }
  });
};

//Update hex value in another schema
//NOTE: Only for this project that I save the hex value used for 2FA on the same database as
//the main database (due to technical restraint). Normally, this value should be put in another
//database that is separated to the main database, and should be only accessed through an API
User.updateHexValueForUser = (username, result) => {
  const statement = sqlStatement.update_set_where_statement(
    "User",
    "two_auth_enabled",
    1,
    "user_name",
    `${username}`
  );
  //query for updating
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("There is an error: ", err);
      result(err, null);
      return;
    }
    //if no row affected (no user matched with username)
    if (res.affectedRows == 0) {
      result({ info: "not_found" }, null);
      return;
    } else {
      //conclusion
      console.log(`upated the hex value for user: ${username}`);
      result(null, res);
      return;
    }
  });
};

//Get the Hex value for user
User.getHexValueForUser = (username, result) => {
  const statement = sqlStatement.select_from_where_statement(
    "hex_value",
    "user_hex_value",
    "user_name",
    `${username}`
  );
  //query for getting
  sql_hex_database.query(statement, (err, res) => {
    if (err) {
      console.log("There is an error: ", err);
      result(err, null);
      return;
    }
    //if there is a response, print out the hex_value, which is the first element of the array
    if (res.length != 0) {
      console.log("found the hex: ", res);
      result(null, res);
      return;
    } else {
      console.log("no hex found!");
      result({ info: "not_found" }, null);
      return;
    }
  });
};

module.exports = User;
