const { Schema, model } = require("mongoose");

const oddsSchema = Schema(
  {
    events: Array,
  },

  { timestamps: true }
);

module.exports = Odds = model("Odds", oddsSchema);
