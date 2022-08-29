const express = require("express");
const router = new express.Router();
const baseURL = "/sportService";

router.use(baseURL, require("./liveSportsRoute"));
router.use(baseURL, require("./oddSettingRoute"));
router.use(baseURL, require('./sportsMarginsRoute'));
router.use(baseURL, require('./bets.routes'));

module.exports = router;
