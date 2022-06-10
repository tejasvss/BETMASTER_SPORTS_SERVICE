const express = require("express");
const router = new express.Router();
const baseURL = "/sportService";

router.use(baseURL, require("./liveSportsRoute"));
router.use(baseURL, require("./oddSettingRoute"));

module.exports = router;
