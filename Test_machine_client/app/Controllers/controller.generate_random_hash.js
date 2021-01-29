const crypto = require("crypto");

exports.generateRandomHash = () => {
  const hash = crypto.randomBytes(15).toString("hex");
  return hash;
};
