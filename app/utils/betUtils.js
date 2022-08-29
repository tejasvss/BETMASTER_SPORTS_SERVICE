let { isNullOrUndefined } = require('util');
let UserBets = require('../models/customer/bets.m')

//Utility_Functions
let utils = {}

utils.isRequestDataValid = (params) => {
    try {
        if (typeof params !== 'object') {
            throw Error('not an object')
        }

        let invalidKeys = [];
        let invalidValues = [];

        for (let [key, value] of Object.entries(params)) {
            if (isNullOrUndefined(params[key])) {
                invalidKeys.push(key)
            }
            else if (value === undefined || value == "") {
                invalidValues.push(key)
            }
        }

        if (invalidKeys.length) {
            return `${invalidKeys[0]} is a required field`
        } else if (invalidValues.length) {
            return `Missing values for KEY === ${invalidValues[0]}`
        }
        else return true
    } catch (e) {
        throw e
    }
}

utils.getNextBetNumber = async (fieldName) => {
    let betNumber = 101010;

    let lastRecord = await UserBets.find({}).sort({ _id: -1 }).limit(1);
    if (lastRecord.length && lastRecord[0][fieldName]) {
        betNumber = parseInt(lastRecord[0][fieldName]) + 1
    }
    return betNumber.toString().padStart(6, "0")
};

utils.checkBetPayloadWithResponse = async (data) => {
    try {
        let response = data.apiResponse.body;
        let payload = data.body;

        if (payload.tournamentName != response.tournament_name) return `Mismatch tournament name .Please provide valid tournament name`
        else if (payload.tournamentId != response.tournament_id) return `Mismatch tournament_id .Please provide valid tournament_id`
        else if (payload.sport_id != response.sport_id) return `Mismatch sport_id .Please provide valid sport_id`
        else if (payload.sport_name !== response.sport_name) return `Mismatch sport_name .Please provide valid sport_name`
        else return true
    }
    catch (e) {
        throw e
    }
}

utils.paginationUtility = async (req, res) => {

    var page = parseInt(req.body.page);
    var size = parseInt(req.body.size);

    var query = {};

    if (!page) {
        page = 1
    }

    if (!size) {
        size = 5
    }

    query.skip = size * (page - 1);
    query.limit = size;
    query.page = page;

    return query;
}

module.exports = utils;