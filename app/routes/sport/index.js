const express = require("express");
const router = new express.Router();
const baseURL = "/sportService";

router.use(baseURL, require("./liveSportsRoute"));
router.use(baseURL, require("./oddSettingRoute"));
router.use(baseURL, require('./sportsMarginsRoute'));

module.exports = router;
