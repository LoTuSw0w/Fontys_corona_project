const model = require("../Models/db.model");
const fs = require("fs");

exports.CheckTestLinkCodeFromResultTable = (req, res) => {
  const testLinkCode = req.body.test_link_code;
  if(checkIfCheckedInOrNot(testLinkCode)){
    return res.status(200).send({ message: "don't be cheeky, someone has already checked in with this code!" });
  }
  //calling the model
  model.CheckTestLinkCodeFromResultTable(testLinkCode, (err, data) => {
    if (err) {
      if (err.info === "not_found") {
        return res.status(404).send({ message: "Invalid test result" });
      }
      return res.status(500).send({ message: `there is an error: ${err}` });
    } //if there is no error
    else {
      writeTestToFileOnGoingIn(testLinkCode);
      if (data.test_result === 0) {
        return res.status(200).send({ message: "you are clean of Corona!" });
      }
      return res
        .status(200)
        .send({ message: "detain this personel immediately!" });
    }
  });
};

exports.checkOut = (req, res) => {
  const testLinkCode = req.body.test_link_code;
  if (checkIfCheckedInOrNot(testLinkCode)) {
    deleteTestOnGoingOut(testLinkCode);
    return res.status(200).send({ message: "successfully checked out!" });
  } else {
    return res.status(404).send({ message: "you haven't checked in yet" });
  }
};

//////////

const writeTestToFileOnGoingIn = (test_link_code) => {
  const fileDirectory = "app/Log_files/check_in_log.txt";
  fs.appendFile(fileDirectory, `${test_link_code}\n`, (err) => {
    if (err) throw err;
  });
};

const checkIfCheckedInOrNot = (test_link_code) => {
  const fileDirectory = "app/Log_files/check_in_log.txt";
  let dataArray = fs.readFileSync(fileDirectory, "utf8").split("\n");
  const index = dataArray.findIndex((index) => index === `${test_link_code}`);
  if (index === -1) {
    return false;
  }
  return true;
};

const deleteTestOnGoingOut = (test_link_code) => {
  const fileDirectory = "app/Log_files/check_in_log.txt";
  fs.readFile(fileDirectory, (err) => {
    if (err) throw error;
    let dataArray = fs.readFileSync(fileDirectory, "utf8").split("\n"); // convert file data in an array
    const index = dataArray.findIndex((line) => line === `${test_link_code}`);
    console.log(index);
    if (index !== -1) {
      dataArray.splice(index, 1); // remove the matching id from the data Array
      // update the file with new data
      const updatedData = dataArray.join("\n");
      fs.writeFile(fileDirectory, updatedData, (err) => {
        if (err) throw err;
        console.log("Successfully updated the file data");
      });
      return true;
    } else {
      console.log("somehow the test code is not in the file!");
      return false;
    }
  });
};
