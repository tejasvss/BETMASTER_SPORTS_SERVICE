const mongoose = require("mongoose");

const marginSchema = new mongoose.Schema({

    eventId: Number,
    marketName: String,
    margin: { type: Number, default: 1 },
    sportsId: Number
}, { versionKey: false })

const OddsMargin = new mongoose.model("Odds_margins", marginSchema);

module.exports = OddsMargin;
