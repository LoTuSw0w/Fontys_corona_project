module.exports = app => {
    const userController = require("../controllers/user.controller");
  
    // Sign up 
    app.post("/user/signup", userController.signUp);
  
    // Retrieve a single user with id
    app.get("/users/:userId", userController.findWithId);

    // Update an user with id
    app.put("/users/:userId", userController.update);

    //sign in
    app.post("/user/login/", userController.signIn);

    //retrieve user with userName
    app.get("/user/:userName", userController.verifyToken, userController.findWithUserName);

    //link test result to user
    app.post("/user/linkTest", userController.linkTestDataToIdWithUserName);

    //create QR picture and return hex
    app.post("/user/twofactor/generate", userController.generateQRAndHexValueRoute);

    //testing the verification of 2FA on registering
    app.post("/user/twofactor/verificationTest", userController.verify2AuthRegister);

    //authorize the 2FA code on sign in (called after sign in route)
    app.post("/user/twofactor/login", userController.verify2FASignIn);
  };