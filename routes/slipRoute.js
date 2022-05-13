const router = require("express").Router();
const authController = require("../controllers/authController");

const betController = require("../controllers/betController");
const slipController = require("../controllers/slipController");

router.use(authController.protect);

router.route("/new-bet").post(betController.addb, slipController.addSlip);

module.exports = router;
