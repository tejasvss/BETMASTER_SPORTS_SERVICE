const router = require("express").Router();

const marginController = require("../../controllers/marginController");

//SportsMarginsRoutes
router
  .route("/post/storeAndUpdateMargins")
  .post(marginController.storeAndUpdateMargins);

router.route("/fetch/getMarketMargins").get(marginController.getMarketMargins);

router
  .route("/fetch/getManipulatedData")
  .get(marginController.getManipulatedData);

router.route("/fetch/getMarketNames").get(marginController.getMarketsNames);

router
  .route("/fetch/getResultsData")
  .get(marginController.getRezChampionsBySport);

router
  .route("/fetch/specificEventsManipulatedData")
  .get(marginController.getSpecificEventsManipulatedData);

module.exports = router;
