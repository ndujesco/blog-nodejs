const { validationResult } = require("express-validator");
const Comment = require("../models/comment");
const Message = require("../models/message");
const Post = require("../models/post");
const User = require("../models/user");
const { sendEmail } = require("../utils/email");

exports.getIndexPage = async (req, res, next) => {
  const posts = await Post.find({
    author: process.env.ADMIN_ID,
  }).populate("author");
  res.render("index", {
    pageTitle: "ugo's blog",
    subTitle: "A collection of my random musings",
    posts,
  });
};

exports.getAboutPage = (req, res, next) => {
  res.render("about", {
    pageTitle: "About",
    subTitle:
      "About Ndujekwu Ugochukwu Peter, Backend Developer, Undergraduate",
  });
};
exports.getContactPage = (req, res, next) => {
  res.render("contact", {
    pageTitle: "Contact",
    subTitle: "Contact Ndujekwu Ugochukwu, Backend Developer, Undergraduate",
  });
};

exports.getMakePost = (req, res, next) => {
  res.render("make-post", {
    pageTitle: "Create Post",
    errors: [],
    prevValues: {},
    errorMessage: "",
    editing: false,
    subTitle: "",
  });
};

exports.postMakePost = async (req, res, next) => {
  const { title, subtitle, imageUrl, body } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("make-post", {
      pageTitle: "Create Post",
      errors: errors.array(),
      prevValues: req.body,
      errorMessage: errors.array()[0].msg,
      editing: false,
      subTitle: "",
    });
  }
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const date = new Date().toLocaleDateString("en-us", options);
  const post = new Post({
    title,
    subtitle,
    body,
    imageUrl,
    date,
    comments: [],
    author: req.user,
  });
  try {
    post.save();
    res.redirect("/");
    const user = await User.findById(req.user._id);
    user.posts.push(post);
    user.save();
  } catch (error) {
    res.redirect("/");
  }
};

exports.getEditPost = async (req, res, next) => {
  const postId = req.query.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.redirect("/post?postId=" + postId);
    }
    return res.render("make-post", {
      pageTitle: "Edit",
      errors: [],
      prevValues: post,
      errorMessage: "",
      editing: true,
      subTitle: "",
    });
  } catch (error) {
    return res.redirect("/post?postId=" + postId);
  }
};

exports.postEditPost = async (req, res, next) => {
  const { title, subtitle, imageUrl, body, postId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("make-post", {
      pageTitle: "Create Post",
      errors: errors.array(),
      prevValues: req.body,
      errorMessage: errors.array()[0].msg,
      editing: true,
      subTitle: "",
    });
  }
  try {
    await Post.findByIdAndUpdate(postId, {
      title,
      subtitle,
      imageUrl,
      body,
    });
    res.redirect("/");
  } catch (error) {
    return res.redirect("/");
  }
};

exports.getShowPost = async (req, res, next) => {
  const postId = req.query.postId;
  try {
    if (!postId) {
      return res.redirect("/");
    }
    const post = await Post.findById(postId)
      .populate("author")
      .populate({
        path: "comments",
        populate: { path: "author", model: "User" },
      });
    res.render("post", {
      pageTitle: post.title,
      post,
      gravatar: require("gravatar"),
      subTitle: post.subtitle,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
};

exports.postComment = async (req, res, next) => {
  const text = req.body.comment;
  const { postId } = req.body;

  try {
    if (!text) {
      return res.redirect("/post?postId=" + postId);
    }
    const comment = new Comment({
      text,
      post: postId,
      author: req.user,
    });
    comment.save();
    const post = await Post.findById(postId);
    post.comments.push(comment);
    await post.save();
    res.redirect("/post?postId=" + postId);
  } catch (error) {
    res.redirect("/post?postId=" + postId);
  }
};

exports.deletePost = async (req, res, next) => {
  console.log(req.query);
  await Post.findByIdAndDelete(req.query.postId);
  res.json({ message: "Deleted Post!" });
};

exports.postContact = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ status: 422, errorMessage: errors.array()[0].msg });
  }
  res.status(200).json({ status: 200 });
  sendEmail(req.body);
  const message = new Message(req.body);
  message.save();
};
