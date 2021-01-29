const sql = require("./db.js");
const sqlStatement = require("./model.sql_statement.js");

//constructor for the model
const TestMachine = function (testMachine) {
  this.machine_name = testMachine.machine_name;
  this.access_code = testMachine.access_code;
  this.brand_name = testMachine.brand_name;
};

//////////////
//functions
//////////////

//generate a new test result
TestMachine.generateNewResult = (
  test_link_code,
  device_number,
  test_area_id,
  test_result,
  result
) => {
  //formating query
  const query = sqlStatement.insert_into_Test_result_statement(
    test_link_code,
    device_number,
    test_area_id,
    test_result
  );
  //querying to the database
  sql.query(query, (err, res) => {
    if (err) {
      //duplicate entry
      if (err.errno == 1062) {
        console.log("duplicate insertion");
        result({ info: "duplicate_insertion" }, null);
        return;
      }
      console.log("test machine: error inserting");
      result(err, null);
      return;
    }
    //if no error then
    console.log("successful insertion");
    result(null, { info: "success" });
  });
};

//inserting socket.id into the database
TestMachine.insertNewSocketId = (machine_id, socket_id) => {};


//get machine name from access_code
TestMachine.getMachineDetailsFromAccessCode = (access_code, result) => {
  //query statement
  const query = sqlStatement.select_from_where_statement(
    ["machine_name","physical_id", "id"],
    "Test_device",
    "access_code",
    access_code
  );
  //querying to the database
  sql.query(query, (err, res) => {
    if (err) {
      if(err.info === "not_found"){
        console.log("No access code matched!");
        result({message: "invalid_code"}, null);
        return;
      }
      console.log("test machine: error querying database");
      result(err, null);
      return;
    }
    //found the name
    if (res.length !== 0) {
      console.log("name: found!");
      result(null, res[0]);
      return;
    }
    //if there is no machine name that matches the accessCode
    else {
      console.log("no name found!");
      result({ info: "not_found" }, null);
      return;
    }
  });
};
 

module.exports = TestMachine;
