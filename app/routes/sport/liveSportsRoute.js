const router = require("express").Router();

const distributionControler = require("../../controllers/distributionControler");

router.route("/addToLive").post(distributionControler.addTolive);
router.route("/removeFromLive").post(distributionControler.removeFromLive);

// get live data for customer app

router.route("/get-event-info/:cat").get(distributionControler.getEventInfo);

router
  .route("/get-sports-data/:cat")
  .get(distributionControler.getBetsApiEvents);

router
  .route("/get-markets-names/:cat")
  .get(distributionControler.getMarketsNames);

router.route("/getSports").post(distributionControler.getSports);

module.exports = router;
