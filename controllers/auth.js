const { validationResult } = require("express-validator");
const { hashPassword, comparePassword } = require("../utils/custom-crypt");
const User = require("../models/user");

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Register",
    errorMessage: "",
    prevValues: {},
    subTitle: "ugo's blog - signup",
  });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    errorMessage: "",
    prevValues: {},
    subTitle: "ugo's blog - login",
  });
};

exports.postSignUp = async (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Register",
      errorMessage: errors.array()[0].msg,
      prevValues: req.body,
      subTitle: "ugo's blog - signup",
    });
  }
  try {
    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      name,
      password: hashedPassword,
      posts: [],
      comments: [],
    });
    await user.save();
    req.session.user = user;
    req.session.isAuthenticated = true;
    return req.session.save((err) => {
      res.redirect("/");
    });
  } catch (error) {
    return res.status(500).render("auth/signup", {
      pageTitle: "Register",
      errorMessage: "Problem with authentication, please bear with us.",
      prevValues: req.body,
    });
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      prevValues: req.body,
      subTitle: "ugo's blog - login",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        errorMessage: "The email does not exist in our database.",
        prevValues: req.body,
        subTitle: "ugo's blog - login",
      });
    }
    const matches = await comparePassword(user.password, password);
    if (!matches) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        errorMessage: "The pasword is incorrect",
        prevValues: req.body,
        subTitle: "ugo's blog - login",
      });
    }
    req.session.user = user;
    req.session.isAuthenticated = true;
    return req.session.save((err) => {
      res.redirect("/");
    });
  } catch (error) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      errorMessage: "Problem with authentication, please bear with us.",
      prevValues: req.body,
      subTitle: "ugo's blog - login",
    });
  }
};

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
