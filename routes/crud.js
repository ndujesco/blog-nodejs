const { Router } = require("express");
const { body } = require("express-validator");
const {
  getIndexPage,
  getAboutPage,
  getContactPage,
  getMakePost,
  getShowPost,
  postMakePost,
  getEditPost,
  postEditPost,
  postComment,
  deletePost,
  postContact,
} = require("../controllers/crud");

const router = Router();
const makePostValidator = [
  body("title", "Title should not be empty").trim().isLength({ min: 1 }),
  body("imageUrl").trim().isLength({ min: 1 }),
  body("body", "Add your write-up to the Blog Content")
    .trim()
    .isLength({ min: 1 }),
];

// const commentValidator = body("comment", "Can't submit empty comment").isLength(
//   { min: 1 }
// );
const checkAdmin = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.redirect("/");
  }
  if (process.env.ADMIN_ID !== req.user.id) {
    return res.redirect("/");
  }
  next();
};

const contactValidator = [
  body("email").custom((value, { req }) => {
    if (!value && !req.body.number) {
      throw new Error("You should include either your phone number or email.");
    }
    return true;
  }),
  body("message", "You did not include a message.").isLength({ min: 1 }),
  body("name", "Your name please? 😥.").isLength({ min: 1 }),
];

const isAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.redirect("/auth/login");
  }
  next();
};
router.get("/", getIndexPage);

router.get("/about", getAboutPage);

router.get("/contact", getContactPage);

router.get("/new-post", isAuth, checkAdmin, getMakePost);
router.post("/new-post", isAuth, checkAdmin, makePostValidator, postMakePost);

router.get("/edit-post", isAuth, checkAdmin, makePostValidator, getEditPost);
router.post("/edit-post", isAuth, checkAdmin, makePostValidator, postEditPost);

router.post("/comment", isAuth, postComment);

router.get("/post", getShowPost);

router.delete("/delete", isAuth, checkAdmin, deletePost);

router.post("/contact", contactValidator, postContact);
module.exports = router;
