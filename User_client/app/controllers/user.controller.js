/////////////////////////////////////////////
// PERPARATION
/////////////////////////////////////////////

const userModel = require("../models/user.model.js"); //User model object

//packages imported from NPM
const bcrypt = require("bcrypt"); //password hasher: https://www.npmjs.com/package/bcrypt
const passwordValidator = require("password-validator"); //password validator: https://www.npmjs.com/package/password-validator
const jwt = require("jsonwebtoken"); //Json web token: https://www.npmjs.com/package/jsonwebtoken
const speakEZ = require("speakeasy"); //two factor authenticator: https://www.npmjs.com/package/speakeasy
const QRCodeGenerator = require("qrcode"); //qrcode: https://www.npmjs.com/package/qrcode

//package imported locally
const fs = require("fs");
const User = require("../models/user.model.js");
const { resolveAny } = require("dns");

//schema and properties for password validator
const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(25) // Maximum length 25
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .is()
  .not()
  .oneOf([
    "Passw0rd",
    "Password123",
    "iloveyou",
    "password",
    "qwerty",
    "123456",
  ]); // Blacklist these values

/////////////////////////////////////////////
// MAIN FUNCTIONS
/////////////////////////////////////////////

//create new user
exports.signUp = (req, res) => {
  //configs for hasing password
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);

  // Validate request
  if (
    !req.body ||
    req.body.user_name === "" ||
    req.body.email === "" ||
    req.body.first_name === "" ||
    req.body.last_name === ""
  ) {
    return res.status(400).send({
      message: "Please enter something for the content!",
    });
  }

  //if the password is valid then
  if (passwordSchema.validate(req.body.password)) {
    //hash the values using bcrypt
    const password_hashed = bcrypt.hashSync(req.body.password, salt);
    const email_hashed = bcrypt.hashSync(req.body.email, salt);
    const first_name_hashed = bcrypt.hashSync(req.body.first_name, salt);
    const last_name_hashed = bcrypt.hashSync(req.body.last_name, salt);

    // create an user model
    const user = new userModel({
      user_name: req.body.user_name,
      password: password_hashed,
      email: email_hashed,
      first_name: first_name_hashed,
      last_name: last_name_hashed,
    });

    //call the create method inside the model
    userModel.create(user, (err, data) => {
      if (err)
        return res.status(500).send({
          message:
            err.message || "Some error occurred while creating the user.",
        });
      else {
        return res.status(200).send(data);
      }
    });
  }
  //If the password is not valid, then
  else {
    const passwordErrorList = passwordSchema.validate(req.body.password, {
      list: true,
    });
    const passwordErrorReturn = []; //array to hold return sentences
    //conditions
    if (passwordErrorList.includes("min")) {
      passwordErrorReturn.push(
        "Password does not meet minimum length (8 characters)"
      );
    }
    if (passwordErrorList.includes("max")) {
      passwordErrorReturn.push(
        "Password exceed maximum length (25 characters)"
      );
    }
    if (passwordErrorList.includes("uppercase")) {
      passwordErrorReturn.push(
        "Password needs to have at least one uppercase character"
      );
    }
    if (passwordErrorList.includes("lowercase")) {
      passwordErrorReturn.push(
        "Password needs to have at least one lowercase character"
      );
    }
    if (passwordErrorList.includes("oneOf")) {
      passwordErrorReturn.push(
        `This password phrase is forbidden: ${req.body.password}`
      );
    }

    //return the password phrases array
    return res.status(401).send({ message: passwordErrorReturn });
  }
};


//get a particular user
exports.findWithId = (req, res) => {
  //calling the function from the model
  userModel.findById(req.params.userId, (err, data) => {
    if (err) {
      //this is the return code that I indicated from the model
      if (err.info === "not_found") {
        return res.status(404).send({
          message: `Not found User with id ${req.params.userId}.`,
        });
      } else {
        return res.status(500).send({
          message: "Error retrieving User with id " + req.params.userId,
        });
      }
    } else return res.status(200).send(data);
  });
};


//update an user
exports.update = (req, res) => {
  //check the request
  if (!req.body) {
    return res.status(400).send({ message: "content cannot be empty!" });
  }
  //else, update the user with the matching id
  userModel.updateAll(
    req.params.userId,
    new userModel(req.body),
    (err, data) => {
      if (err) {
        if (err.info == "not_found") {
          return res.status(404).send({
            message: `cannot find the user with id ${req.params.userId}!`,
          });
        } else {
          return res.status(500).send({
            message: `there is error updating user with id ${req.params.userId}!`,
          });
        }
      } else {
        return res.status(200).send(data);
      }
    }
  );
};

//sign in function with JWT authentication, returns hex value if user has 2FA enabled!
exports.signIn = (req, res) => {
  const userName = req.body.user_name;
  const password = req.body.password;
  //find username and password using the model
  userModel.getUsernameAndPassword(userName, (err, data) => {
    if (err) {
      if (err.info === "not_found") {
        return res.status(404).send({
          message: `No user name found!.`,
        });
      } else {
        return res.status(500).send({
          message: "Error retrieving User with username: " + userName,
        });
      }
    } else {
      const databasePasswordHash = data.password + ""; //save password to compare!
      //compare using bcrypt built-in function
      bcrypt.compare(password, databasePasswordHash, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        if (data) {
          //sign a new session that expires in 1 day
          jwt.sign(
            { User: { user: userName, password: password } },
            "superSecretKey",
            { expiresIn: "1d" },
            (err, token) => {
              if (err) {
                return res.status(500).json({
                  message: `There is something wrong with signing a new web token! Error: ${err}`,
                });
              } else {
                //put 2FA check here
                User.check2AuthStatus(userName, (err, data) => {
                  if (err) {
                    return res.status(500).json({
                      message: "there is an error with 2FA verification!",
                    });
                  } else {
                    //if this user has 2FA enabled
                    if (data == 1) {
                      //get the hex value from the database then return it along side with the jwt token
                      User.getHexValueForUser(userName, (err, data) => {
                        if (err) {
                          return res.status(500).json({
                            message:
                              "there is an error with getting the hex value!",
                          });
                        } else {
                          return res
                            .status(200)
                            .json([{ jwt_token: token }, data[0]]);
                        }
                      });
                    } //if this user has not enabled 2FA, then just return the login token
                    else {
                      return res.status(200).json(token + "");
                    }
                  }
                });
              }
            }
          );
        }
        //if wrong password then
        else {
          return res.status(400).json({ message: "wrong password!" });
        }
      });
    }
  });
};

//get all details from the current logged in user
exports.findWithUserName = (req, res) => {
  //calling the function from the model
  userModel.findbyUserName(req.params.userName, (err, data) => {
    if (err) {
      return res
        .status(403)
        .json({ message: `There is an error! Details: ${err}` });
    } else {
      jwt.verify(req.token, "superSecretKey", (err, authData) => {
        if (err) {
          if (err.info === "not_found") {
            return res.status(404).json({
              message: `Not found User with username ${req.params.userName}.`,
            });
          } else
            return res
              .status(403)
              .json({ message: `error with authentication! Details: ${err}` });
        } else {
          //check if the username in the token matches the user profile (logged in user can only see their own profile!)
          if (data.user_name == authData.User.user) {
            return res.status(200).json({ data, authData });
          } else {
            return res
              .status(451)
              .json({ message: "You are not allowed to see others' profile!" });
          }
        }
      });
    }
  });
};

//link the test data to current user
exports.linkTestDataToIdWithUserName = (req, res) => {
  //defind the bodies as variables
  const userName = req.body.user_name;
  const testLinkingCode = req.body.test_linking_code;

  //calling the function from the model
  userModel.linkUserToTest(userName, testLinkingCode, (err, data) => {
    if (err) {
      if (err.info === "not_found") {
        return res
          .status(404)
          .json({ message: `not found user with user name ${userName}` });
      }
      //if the parameters for the update statement are wrong
      else if (err.info === "no_row_affected") {
        return res.status(404).json({
          message: `Make sure that the either the test linking code or the user is correct!`,
        });
      } else {
        return res
          .status(500)
          .json({ message: `something is wrong (controller): ${err}` });
      }
    } else {
      return res.status(200).json({ message: data });
    }
  });
};

//generate QR code and return hex data through JSON
exports.generateQRAndHexValueRoute = (req, res) => {
  const username = req.body.user_name;
  generateTwoFactorQRAndReturnHex(username, (callbackValue) => {
    //call the callback declared in the function
    //call the function to generate QR and Hex value
    if (callbackValue === "unknown_error") {
      return res.status(500).json({ message: "there is an unknown error!" });
    }
    if (callbackValue === "not_found_user_name") {
      console.log("im here!");
      return res.status(404).json({ message: "no user name matched!" });
    }
    if (callbackValue === "2auth_already_enabled") {
      return res
        .status(500)
        .json({ message: "2FA has already been authorized!" });
    }
    if (callbackValue === "There is an error with generating the qr value!") {
      return res.status(500).json({ message: "error generating QR value!" });
    } else {
      return res.status(200).json({ hex_value: callbackValue + "" });
    }
  });
};

exports.verify2AuthRegister = (req, res) => {
  const username = req.body.user_name;
  const secretValue = req.body.secret_value;
  const tokenValue = req.body.token_value;
  const verified = speakEZ.totp.verify({
    secret: secretValue,
    encoding: "hex",
    token: tokenValue,
  });
  if (verified) {
    //call the two functions from the model to update the database
    User.UpdateHexValue(username, secretValue, (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "There is an error in updating the hex value!" });
      } else {
        if (data.info === "finished!") {
          User.updateHexValueForUser(username, (err, data) => {
            if (err) {
              if (err.info === "not_found") {
                return res
                  .status(404)
                  .json({ message: "Username cannot be found, somehow..." });
              } else {
                return res
                  .status(500)
                  .json({ message: "There is an unknown erro!" });
              }
            } //finish the function
            else {
              return res.status(200).json({
                message: `Finished updating hex value and 2FA status!`,
              });
            }
          });
        } else {
          return res.status(500).json({ message: "cannot continue!" });
        }
      }
    });
  } //if speakeasy cannot verify the data
  else {
    return res.status(400).json({ message: "try again with the 2FA!" });
  }
};

/////////////////////////////////////////////
// SUPPORT FUNCTIONS
/////////////////////////////////////////////

//jwt authorization middleware
exports.verifyToken = (req, res, next) => {
  //save authorization header value
  const headerBearer = req.headers["authorization"];
  //check if bearer is valid
  if (typeof headerBearer !== "undefined") {
    //split at the space
    const bearer = headerBearer.split(" ");
    //get token from the array
    const token = bearer[1];
    //assign the token to request's token
    req.token = token;
    //call the next middleware function
    next();
  } else {
    //without token, you will not allowed to log in!
    return res.status(403).send({ message: "access forbidden!" });
  }
};

//enable two factor authenticator from user, using callback for asynchronous
const generateTwoFactorQRAndReturnHex = (username, callback) => {
  userModel.check2AuthStatus(username, (err, data) => {
    if (err) {
      if (err.info === "not_found") {
        callback("not_found_user_name");
        return;
      } else {
        callback("unknown_error");
        return;
      }
    } else {
      if (data === "1") {
        callback("2auth_already_enabled");
        return;
      } else {
        const secret = speakEZ.generateSecret({
          name: "Corona Testing App",
          symbols: true,
        });
        QRCodeGenerator.toDataURL(secret.otpauth_url, (err, QRData) => {
          if (err) {
            callback("There is an error with generating the qr value!");
            return;
          } else {
            //putting this into src tag of img inside HTML will give QR code picture
            writeQRDataToHTML(QRData);
            const hexValue = secret.hex + ""; //choosing hex as the secret value
            callback(hexValue);
            return;
          }
        });
      }
    }
  });
};

//function to write the QR code to HTML
const writeQRDataToHTML = (QRdata) => {
  fs.writeFile(
    "./app/media/qrCodeFile.html",
    `<img src=${QRdata} ></img>`,
    (err) => {
      if (err) {
        console.log("write to HTML error" + err);
        return { message: `error with writing to HTML: ${err}` };
      } else {
        console.log("successfully written the file to HTML");
        return { message: `successfully written the file to HTML` };
      }
    }
  );
};

//verifying the 2FA on sign in
exports.verify2FASignIn = (req, res) => {
  const secretValue = req.body.secret_value;
  const tokenValue = req.body.token_value;
  const verified = speakEZ.totp.verify({
    secret: secretValue,
    encoding: "hex",
    token: tokenValue,
  });
  if (verified) {
    return res.status(200).json({ message: "Corect code!" });
  } else {
    return res.status(400).json({ message: "wrong code!" });
  }
};
