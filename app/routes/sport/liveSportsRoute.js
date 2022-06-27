const router = require("express").Router();

const distributionControler = require("../../controllers/distributionControler");

router.route("/add-to-live").post(distributionControler.addTolive);
router.route("/remove-from-live").post(distributionControler.removeFromLive);

// get live data for customer app

router.route("/get-event-info/:cat").get(distributionControler.getEventInfo);

router
  .route("/get-sports-data/:cat")
  .get(distributionControler.getBetsApiEvents);

module.exports = router;
