const express = require('express');
const router = new express.Router();


const customerAuthorization = require('../../config/customerAuthorization');
const betsController = require('../../controllers/bets.controller');

router.post('/bets/placeBet', customerAuthorization.verifyToken, betsController.placeBet);
router.post('/bets/fetchBetsHistory', customerAuthorization.verifyToken, betsController.fetchBetsHistory);

module.exports = router;