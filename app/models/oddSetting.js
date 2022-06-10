const { Schema, model } = require("mongoose");

const oddSetting = Schema(
  {
    fixtureId: String,
    margin1X2: {
      type: Number,
      default: 1,
    },
    marginDouble: {
      type: Number,
      default: 1,
    },
    marginHandicap: {
      type: Number,
      default: 1,
    },
    marginUnderOver: {
      type: Number,
      default: 1,
    },
    minDef: {
      type: Number,
      default: 0,
    },
    minOdd: {
      type: Number,
      default: 1,
    },
    maxOdd: {
      type: Number,
      default: 1000,
    },
  },

  { timestamps: true }
);

module.exports = Odds = model("OddSetting", oddSetting);
