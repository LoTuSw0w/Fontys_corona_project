const userController = require('../controllers/user.controller');

test("expect findWithId to return an user object", () => {
  userController.findWithId();
  expect(returnCallbackObject(result)).toBe(3);
});
