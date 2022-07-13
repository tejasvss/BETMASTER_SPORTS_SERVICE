const OddsMargin = require('../models/margin');
const config = require("../constants/appConstants.json");
const sendHttp = require("../utils/sendHttpReq");



//Storing margins
exports.storeAndUpdateMargins = async (req, res) => {
    try {

        let {
            eventId,
            margin,
            markets,
            sportsId
        } = Object.assign(req.body);

        if (!eventId || !sportsId || !markets || !markets.length) return res.status(400).send({ status: 400, Message: "Missing eventId,margin,marketName or sportsId is missing in payload request" })

        let response = [];

        for (const market of markets) {

            await OddsMargin.findOneAndUpdate({ eventId, marketName: market.marketName, sportsId }, {
                $set: {
                    eventId, margin: market.margin, marketName: market.marketName, sportsId
                }
            }, { new: true, upsert: true }).then((marginData) => {

                response.push(marginData)
            })
        }

        res.status(200).send({ status: 200, Message: "Odd's manipulated successfully", Data: response })
    }
    catch (error) {
        res.status(500).send({ status: 500, Message: error.message })
    }

}

//Fetching the margins based on eventId,category,sportsId
exports.getMarketMargins = async (req, res) => {

    try {
        let {
            eventId,
            sportsId
        } = Object.assign(req.query);

        if (!eventId, !sportsId) return res.status(400).send({ status: 400, Message: "Missing eventId or sportsId in the payload request" })

        const marginsData = await OddsMargin.find({ eventId, sportsId });
        if (!marginsData.length) return res.status(200).send({ status: 200, Message: "No manipulated margins available" })

        res.status(200).send({ status: 200, Message: "Fetching manipulated margins success", Data: marginsData })
    }
    catch (error) {
        res.status(500).send({ status: 500, Message: error.message })
    }
}

//Fetching manipulatedData
exports.getManipulatedData = async (req, res) => {

    try {
        let {
            category,
            sportsId
        } = Object.assign(req.query);

        if (!sportsId || !category) return res.status(400).send({ status: 400, Message: "Missing sportsId or category in payload request" })

        //To fetch the all Events based on sportsId and category
        let eventsUrl = config.API_URL + `/v1/events/${sportsId}/0/list/10/${category}/en`;

        const options = {
            method: "GET",
            headers: {
                Package: config.BET_API_TOKEN,
            },
        };

        eventsData = await sendHttp(eventsUrl, options);

        if (!eventsData.body.length) return res.status(400).send({ "status": 1, "page": "/v1/events", body: [] })

        //Filtering the game_id's from the response
        let allEvents = await eventsData.body.map(x => { return x.game_id });

        let sportsData = [];

        //Iterating the game_id's
        for (const event of allEvents) {

            const manipulatedResponse = await OddsMargin.find({ eventId: event, sportsId });

            let url = config.API_URL + `/v1/event/${event}/list/${category}/en`;

            const options = {
                method: "GET",
                headers: {
                    Package: config.BET_API_TOKEN,
                },
            };

            let response = {};

            if (!manipulatedResponse.length) {
                response = await sendHttp(url, options);
            }

            else if (manipulatedResponse.length) {

                response = await sendHttp(url, options);

                //Iterating the Bet_Api to manipulate the data
                for (const markets of response.body.game_oc_list) {

                    for (const response of manipulatedResponse) {

                        if (response.marketName == markets.oc_group_name) {

                            markets.oc_rate = parseFloat((markets.oc_rate * response.margin).toFixed(2));
                        }
                    }
                }

            }
            sportsData.push(response.body)
        }
        return res.status(200).send({ "status": 1, "page": "/v1/events", body: sportsData })
    }
    catch (error) {
        res.status(500).send({ status: 500, Message: error.message })
    }
}