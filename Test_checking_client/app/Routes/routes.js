module.exports = (app) => {
    const controller = require("../Controllers/controller");
  // simple route
  app.get("/", (req, res) => {
    res.json({ message: "Fontys Corona Application - Test Results Checking server" });
  });

  //get the test result and check in
  app.post("/checkTest",controller.CheckTestLinkCodeFromResultTable);

  //check out
  app.post("/checkout",controller.checkOut);

};
