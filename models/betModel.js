const { Schema, model } = require("mongoose");

const bettingSchema = Schema(
  {
    odds: [Number],
    start: Date,
  },
  { toJSON: { vurtials: true }, toObject: { vurtials: true } }
);

module.exports = model("Betting", bettingSchema);
