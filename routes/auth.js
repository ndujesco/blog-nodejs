const { Router } = require("express");
const { body } = require("express-validator");

const {
  getLogin,
  getSignup,
  postSignUp,
  postLogin,
  getLogout,
} = require("../controllers/auth");
const User = require("../models/user");

const router = Router();

const loginValidator = [
  body("email", "Please enter a valid email").isEmail(),

  body("password", "The password must contain at least five characters")
    .isLength({ min: 5 })
    .trim(),
];
const signupValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "E-mail already exists, try a new one or log in"
          );
        }
      });
    })
    .normalizeEmail(),

  body("password", "The password must contain at least five characters")
    .isLength({ min: 5 })
    .trim(),

  body("name", "Name cannot be empty").isLength({ min: 1 }).trim(),
];

router.get("/login", getLogin);

router.get("/register", getSignup);

router.post("/register", signupValidator, postSignUp);

router.post("/login", loginValidator, postLogin);

router.get("/logout", getLogout);
module.exports = router;
