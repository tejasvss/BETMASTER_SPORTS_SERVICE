const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// auth

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);

// update email

router.use(authController.protect);
router
  .route("/send-change-email-token")
  .post(userController.createSendEmailToken);
router.route("/change-email").patch(userController.updateUserEmail);

router.route("/update-profile").patch(userController.updateUserProfile);

module.exports = router;
