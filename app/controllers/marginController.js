const OddsMargin = require('../models/margin');
const config = require("../constants/appConstants.json");
const sendHttp = require("../utils/sendHttpReq");


const options = {
    method: "GET",
    headers: {
        Package: config.BET_API_TOKEN,
    },
};


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
        let eventsUrl = config.API_URL + `/v1/events/${sportsId}/0/sub/30/${category}/en`;

        eventsData = await sendHttp(eventsUrl, options);

        if (!eventsData.body.length) return res.status(400).send({ "status": 1, "page": "/v1/events", body: [] });

        for (var list of eventsData.body) {

            for (var event of list.events_list) {

                const manipulatedResponse = await OddsMargin.find({ eventId: event.game_id, sportsId });

                let url = config.API_URL + `/v1/event/${event.game_id}/list/${category}/en`;

                if (!manipulatedResponse.length) {

                    response = await sendHttp(url, options);

                    event.game_oc_list = response.body.game_oc_list;
                }

                else if (manipulatedResponse.length) {

                    for (const markets of event.game_oc_list) {

                        for (const responses of manipulatedResponse) {

                            if (responses.marketName == markets.oc_group_name) {

                                markets.oc_rate = parseFloat((markets.oc_rate * responses.margin).toFixed(2));
                            }
                        }
                    }
                }
            }
        }
        return res.status(200).send({ "status": 1, "page": "/v1/events", body: eventsData.body })
    }
    catch (error) {
        res.status(500).send({ status: 500, Message: error.message })
    }
}