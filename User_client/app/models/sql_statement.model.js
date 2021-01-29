const mysql = require("mysql");

//select statements

exports.select_from_where_statement = (select, from, where, value) => {
  var query = "SELECT ?? FROM ?? WHERE ?? = ?;";
  var inserts = [select, from, where, value];
  return (query = mysql.format(query, inserts));
};

exports.select_all_statement = (from, where, where_val) => {
  var query = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = [from, where, where_val];
  return query = mysql.format(query, inserts);
}

//insert statements

exports.insert_user_statement = (values) => {
  var query = "INSERT INTO User (user_name, password, email, first_name, last_name) VALUES (?);";
  var inserts = [values];
  return (query = mysql.format(query, inserts));
};

//update statements

exports.update_set_where_statement = (
  update,
  set,
  valueSet,
  where,
  valueWhere
) => {
  var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?;";
  var inserts = [update, set, valueSet, where, valueWhere];
  return (query = mysql.format(query, inserts));
};

exports.update_user = (user_name, password, email, first_name, last_name, id) => {
  var query = "UPDATE User SET user_name = ?, email = ?, first_name = ?, last_name = ? where user_id = ?;";
  var inserts = [user_name, password, email, first_name, last_name, id];
  return query = mysql.format(query,inserts);
}
