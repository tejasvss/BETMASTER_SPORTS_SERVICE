const router = require("express").Router();

const distributionControler = require("../controllers/distributionControler");

router.route("/add-to-live").post(distributionControler.addTolive);
router.route("/remove-from-live").post(distributionControler.removeFromLive);

// get live data for customer app

router
  .route("/get-live-sports-data/:cat")
  .get(distributionControler.getLiveMatches);

// get pure data for superAdmin

router
  .route("/get-stm-sports-data/:cat")
  .get(distributionControler.getStmMatches);

module.exports = router;
