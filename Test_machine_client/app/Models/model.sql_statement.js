const mysql = require("mysql");

exports.select_from_where_statement = (select, from, where, value) => {
  var query = "SELECT ?? FROM ?? WHERE ?? = ?;";
  var inserts = [select, from, where, value];
  return (query = mysql.format(query, inserts));
};

////////
//Insert statement
////////

exports.insert_into_Test_result_statement = (
  test_link_code,
  device_number,
  test_area_id,
  test_result
) => {
  var query =
    "INSERT INTO Test_result(time_and_date, test_link_code,fk_device_number, fk_test_area_id, test_result) VALUES (now(),?,?,?,?);";
  var inserts = [test_link_code, device_number, test_area_id, test_result];
  return (query = mysql.format(query, inserts));
};

exports.insert_into_socketId_testing_machine_matching_table = (
  machine_id,
  socket_id
) => {
  var query =
    "INSERT INTO testing_machine_matching_socket_id(machine_id, socket_id) VALUES (?,?);";
  var inserts = [machine_id, socket_id];
  return (query = mysql.format(query, inserts));
};

