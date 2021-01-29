const sqlStatement = require("./sql_statement.model");
const sql = require("../Models/db");

exports.CheckTestLinkCodeFromResultTable = (testLinkCode, result) => {
  //sql statement
  const statement = sqlStatement.select_from_where_statement(
    ["test_number","test_result"],
    "Test_result",
    "Test_link_code",
    `${testLinkCode}`
  );
  //querying
  sql.query(statement, (err, res) => {
    if (err) {
      console.log("there is an error: ", err);
      result(err, null);
      return;
    } 
    else //if there is no error then
    {
      if (res.length != 0) {
        console.log("test matched", res);
        result(null, res[0]);
        return;
      } else {
        console.log("test invalid");
        result({ info: "not_found" }, null);
        return;
      }
    }
  });
};
