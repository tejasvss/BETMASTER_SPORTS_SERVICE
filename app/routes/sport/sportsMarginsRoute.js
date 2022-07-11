const router = require("express").Router();

const marginController = require("../../controllers/marginController");


//SportsMarginsRoutes
router.
    route("/post/storeAndUpdateMargins").
    post(marginController.storeAndUpdateMargins);

router
    .route("/fetch/getMarketMargins")
    .get(marginController.getMarketMargins);

router
    .route("/fetch/getManipulatedData")
    .get(marginController.getManipulatedData);


module.exports = router;
