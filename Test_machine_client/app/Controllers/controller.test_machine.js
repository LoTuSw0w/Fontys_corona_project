const generateRandomHashObject = require("./controller.generate_random_hash.js");
const testMachineModel = require("../Models/model.test_machine.js");
const fs = require("fs");
///////////////
///////////////

exports.generateTestResult = (req, res) => {
  //get the values from the JSON body
  const test_link_code = generateRandomHashObject.generateRandomHash();
  const device_number = req.body.device_number;
  const test_area_id = req.body.test_area_id;
  const test_result = req.body.test_result;

  if (checkIfAMachineHasAlreadyConnected(device_number)) {
    //calling the model
    CallingGenerateResultModel(
      test_link_code,
      device_number,
      test_area_id,
      test_result,
      res
    );
  } else {
    console.log("The machine needs to connect to the server!");
    return res.status(403).send({message:"The machine needs to connect to the server!"});
  }
};

const CallingGenerateResultModel = (
  test_link_code,
  device_number,
  test_area_id,
  test_result,
  res
) => {
  testMachineModel.generateNewResult(
    test_link_code,
    device_number,
    test_area_id,
    test_result,
    (err, data) => {
      //handling errors
      if (err) {
        //if duplicate
        if (err.info === "duplicate_insertion") {
          return res
            .status(400)
            .send({ message: "duplicate entry in the table" });
        }
        return res.status(500).send({ message: `error: ${err.message}` });
      }
      //if no errors took place then
      fs.appendFile(
        "app/Controllers/Logs/testLog.txt",
        `Device number: ${device_number} | Test Area: ${test_area_id} | Test link code: ${test_link_code} | Test result: ${test_result}\n`,
        (err) => {
          if (err) throw err;
          return res.status(200).send({
            message: `${test_link_code}`,
          });
        }
      );
    }
  );
};

const checkIfAMachineHasAlreadyConnected = (machineId) => {
  let dataArray = fs.readFileSync('app/Controllers/Logs/currentlyConnectedMachine.txt',"utf8").split('\n');
  const index = dataArray.findIndex(index => index === `${machineId}`);
  if(index === -1){
    return false;
  }
  return true;
};

///////////////
///////////////

exports.getMachineDetailsFromAccessCode = (accessCode, callback) => {
  //calling the model
  testMachineModel.getMachineDetailsFromAccessCode(accessCode, (err, data) => {
    if (err) {
      //if the code given does not match any machine then
      if (err.message === "invalid_code") {
        callback("not_found");
        return;
      }
      //if there is an unknown error then
      callback("an_error_occured");
      return;
    }
    //if no error then
    callback(data);
    return;
  });
};
