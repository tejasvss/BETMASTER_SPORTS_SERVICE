const User = require("../models/userModel.js");
const crypto = require("crypto");

// we can add more features like upload user profile image

// without errror handling
exports.updateUserProfile = async (req, res, next) => {
  // here we set a user prop in req Object
  // we have to cover multiple senarios if emmil or mobile update we need to send verifaction otp to emmil as they stand in the same update form
  // this is for nick name only
  const user = await User.findOneAndUpdate(req.user.id, req.body, {
    new: true,
  });
  if (!user) return "error";

  // return new Updated user
  res.status(202).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.createSendEmailToken = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return "error";

  const verifTokon = user.createEmailUpdateToken();
  user.save();

  // here we need to send Token to old email

  // return new Updated user
  res.status(200).json({
    status: "success",
    message: "token send succsesfuly",
    opt: verifTokon,
  });
};
exports.updateUserEmail = async (req, res, next) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailUpdateToken: hashedToken,
    emailUpdateOtpExpiredAt: { $gt: Date.now() },
  });

  if (!user) return "error";

  user.email = req.body.email;
  user.emailUpdateToken = undefined;
  user.emailUpdateOtpExpiredAt = undefined;
  await user.save();
  // return new Updated user
  res.status(202).json({
    status: "success",
    data: {
      user,
    },
  });
};
