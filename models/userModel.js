const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = Schema(
  {
    nickName: {
      type: String,
      unique: [true, "This Name Already Taken!"],
    },
    email: {
      type: String,
      unique: [true, "This Email already In Use!"],
      validate: [validator.isEmail, "Please Entre A Valide Email"],
    },
    password: {
      type: String,
      validate: {
        validator: function (val) {
          const regex =
            /^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{8,}$/;
          return regex.test(val);
        },
        message:
          "Password has to be more than 8 char long and Contains a spatial char (e.x @)",
      },
    },
    mobile: {
      type: String,
      unique: [true, "this mobile Number already taken!"],
    },
    mobileUpdateToken: {
      type: String,
    },
    mobileUpdateddAt: {
      type: Date,
    },
    mobileUpdateOtpExpiredAt: {
      type: Date,
    },
    emailUpdateToken: String,
    emailUpdateddAt: Date,
    emailUpdateOtpExpiredAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// crypting password
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.passwordCorrect = async function (password, inputPassword) {
  return await bcrypt.compare(password, inputPassword);
};

userSchema.pre("save", function (next) {
  if (!this.isModified("mobile") || this.isNew) return next();

  this.MobileUpdateddAt = Date.now() - 1000;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("emile") || this.isNew) return next();

  this.emailUpdateddAt = Date.now() - 1000;
  next();
});

userSchema.methods.createEmailUpdateToken = function () {
  // here we can change by setting a Update Url
  // const token = crypto.randomBytes(32).toString('hex');

  const token = String(Math.trunc(Math.random() * 123456)).toString("hex");

  this.emailUpdateToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // expired after 10min
  this.emailUpdateOtpExpiredAt = Date.now() + 10 * 60 * 1000;

  return token;
};
userSchema.methods.createMobileUpdateToken = function () {
  const token = String(Math.trunc(Math.random() * 123456)).toString("hex");
  this.mobileUpdateToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // expired after 10min
  this.mobileUpdateOtpExpiredAt = Date.now() + 10 * 60 * 1000;

  return token;
};
module.exports = model("User", userSchema);
