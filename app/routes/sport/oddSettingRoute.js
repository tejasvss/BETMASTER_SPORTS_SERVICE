const router = require("express").Router();

const oddSettingController = require("../../controllers/oddSettingController");

router.route("/change-odd-Setting").post(oddSettingController.addOddSetting);
router
  .route("/get-setting/:fixtureId")
  .get(oddSettingController.getSettingByFixture);
module.exports = router;
