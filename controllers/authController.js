const User = require("../models/userModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
};

exports.login = async (req, res, next) => {
  // here we can chek for id ensted of email

  const { email, password } = req.body;

  if (!email || !password) {
    return "error";
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.passwordCorrect(password, user.password))) {
    return "error";
  }
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    // this for postman bearer or get it from req.body
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return "error";
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return "error";
  }

  req.user = currentUser;
  next();
};
