require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");

const crudRoutes = require("./routes/crud");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const gravatar = require("gravatar");
const Post = require("./models/post");

const MONGODB_PRACTICE_URI = "mongodb://localhost:27017/blogDB";
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.83uvt.mongodb.net/blogDB?retryWrites=true&w=majority`;

const main = async () => {
  await mongoose.connect(MONGODB_URI);
};
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(express.static("public"));

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    req.isAuthenticated = req.session.isAuthenticated;
    next();
  } catch (error) {
    console.log(error); //penyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
  }
});

app.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.year = new Date().getFullYear();
  let isAdmin;
  if (req.isAuthenticated) {
    isAdmin = process.env.ADMIN_ID === req.user.id;
  }
  res.locals.isAdmin = isAdmin;

  const posts = await Post.find();
  const titles = [];

  posts.forEach((post) => {
    titles.push(post.title);
  });
  res.locals.titles = titles;
  next();
});
app.use(crudRoutes);
app.use("/auth", authRoutes);

app.use((req, res, next) => {
  const url = decodeURI(req.url);

  res.render("404", {
    pageTitle: "404",
    url,
    subTitle: "Page Not Found Collection of random-musings",
  });
  
});
main()
  .then((connect) => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("E deh rush!!!");
    });
  })
  .catch((err) => {
    console.log("There was an error connecting to the mongoDB database");
  });
