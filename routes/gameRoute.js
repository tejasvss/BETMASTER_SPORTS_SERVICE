const router = require("express").Router();
const authController = require("../controllers/authController");

const gameController = require("../controllers/gameController");

router.use(authController.protect);

router.route("/create-bet-games");

module.exports = router;
