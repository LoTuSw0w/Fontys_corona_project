module.exports = (app) => {
  const testMachineController = require("../Controllers/controller.test_machine");

  // simple route
  app.get("/", (req, res) => {
    res.json({ message: "Fontys Corona Application - Test Machine server" });
  });
  
  //insert new test result
  app.post("/testMachine/insertNewResult", testMachineController.generateTestResult);

};
