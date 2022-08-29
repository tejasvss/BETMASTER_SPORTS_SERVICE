let UserBets = require('../models/customer/bets.m');
let User = require('../models/customer/customer');
let { isRequestDataValid, getNextBetNumber, checkBetPayloadWithResponse, paginationUtility } = require('../utils/betUtils');
const sendHttp = require("../utils/sendHttpReq");
const config = require("../constants/appConstants.json");
const { response } = require('express');


exports.placeBet = async (req, res) => {
    try {
        let {
            sport_name,
            sport_id,
            amount,
            game_id,
            game_start,
            tournamentId,
            tournamentName,
            oc_group_name,
            oc_name,
            oc_rate,
            category
        } = Object.assign(req.body)

        let requiredField = {
            sport_name,
            sport_id,
            amount,
            game_id,
            game_start,
            tournamentId,
            tournamentName,
            oc_group_name,
            oc_name,
            oc_rate,
            category
        };
        let requestDataValid = isRequestDataValid(requiredField)
        if (requestDataValid !== true) throw Error(requestDataValid);


        if (parseFloat(req.user.walletBalance) < parseFloat(amount)) throw Error("Insufficient funds.Please add funds into wallet")

        if (sport_id != 1 && sport_id != 4 && sport_id != 66) throw Error("Please place bets on cricket,soccer and tennis only.")

        let apiUrl = config.BETMASTER_SPORTS_API_BASEURL + `/fetch/getBackendSpecificEventsManipulatedData?category=${category}&eventId=${game_id}`;
        let apiResponse = await sendHttp(apiUrl);
        console.log({ apiResponse })


        if (Array.isArray(apiResponse.body)) throw Error("No match for your entered game_id and category")
        else if (apiResponse.body == "Page not found!" || !apiResponse.body) throw Error("Invalid game_id or category or sport_name")

        else {

            let winningAmount = parseFloat(oc_rate * amount)
            let body = {
                userId: req.id,
                sport_name,
                sport_id: parseInt(sport_id),
                amount: parseFloat(amount),
                game_id: parseInt(game_id),
                game_start: parseInt(game_start),
                tournamentId: parseInt(tournamentId),
                tournamentName,
                oc_group_name,
                oc_name,
                oc_rate: parseFloat(oc_rate),
                winningAmount: winningAmount.toFixed(2)
            }

            let checkPayload = await checkBetPayloadWithResponse({ body, apiResponse })
            if (checkPayload != true) throw Error(checkPayload)

            //Finding the user selected market is exist or not
            let checkMarket = await apiResponse.body.game_oc_list.find((x) => {
                if (x.oc_group_name === oc_group_name && x.oc_name === oc_name)
                    return x;
            })

            console.log({ checkMarket })

            if (!checkMarket) throw Error("Your provided market is invalid or not available.")
            else {
                if (checkMarket.oc_rate != oc_rate) throw Error("Market value changed.Try again.")
                else if (checkMarket.oc_rate == oc_rate) {
                    body.betNumber = await getNextBetNumber('betNumber');
                    const [BetsData, UserData] = await Promise.all([
                        UserBets.create(body),
                        User.findOneAndUpdate({ _id: req.id }, { $inc: { walletBalance: -parseFloat(amount) } }, { new: true }).select('walletBalance')
                    ])

                    return res.status(200).send({ status: 200, Message: "Bet placed successfully", Data: { BetsData, UserData } })
                }
            }
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send({ status: 500, Message: e.message || "Placing bets failed" })
    }
}


exports.fetchBetsHistory = async (req, res) => {
    try {

        let userId = req.id;
        let dbQuery = { userId }

        if (req.body.fromDate && req.body.toDate) {
            dbQuery.createdAt = { $gte: new Date(req.body.fromDate).setHours(00, 00, 00), $lt: new Date(req.body.toDate).setHours(23, 59, 59) }
        }

        let totalBetsCount = await UserBets.find({ userId }).countDocuments();
        let paginationData = await paginationUtility(req, res);
        const totalPages = totalBetsCount / paginationData.limit;
        console.log({ dbQuery })

        const betsData = await UserBets.find(dbQuery).sort('-createdAt').limit(paginationData.limit).skip(paginationData.skip);
        res.status(200).send({
            status: 200,
            Message: "Bets history  fetched succesfully",
            totalBetsCount: totalBetsCount,
            totalPages: Math.ceil(totalPages),
            currentPage: paginationData.page,
            currentPageWithdrawlsCount: betsData.length,
            Data: betsData
        })
    }
    catch (error) {
        res.status(500).send({ status: 500, Message: e.message || "Fetching bets failed" })
    }
}


