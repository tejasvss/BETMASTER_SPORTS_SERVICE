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

router
  .route("/fetch/getManipulatedDataAlt")
  .get(marginController.getManipulatedDataAlt);

router.route("/fetch/getMarketNames").get(marginController.getMarketsNames);

router
  .route("/fetch/getManipalatedTournament")
  .get(marginController.getManipulatedByTournament);

router
  .route("/fetch/getManipalatedOrderTournament")
  .get(marginController.getManipulatedTour);

router
  .route("/fetch/getResultsData")
  .get(marginController.getRezChampionsBySport);

router
  .route("/fetch/specificEventsManipulatedData")
  .get(marginController.getSpecificEventsManipulatedData);




/*This api is for backend work purposes only.Not for frontend*/
router
  .route("/fetch/getBackendSpecificEventsManipulatedData")
  .get(marginController.getBackendSpecificEventsManipulatedData);

module.exports = router;
