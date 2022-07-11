const { Schema, model } = require("mongoose");

const betapiSportsSchema = Schema(
  {
    category: {
      type: String,
      enum: ["live", "line"],
    },
    sportId: Number,
    isLive: { type: Boolean, default: false },
    name: { type: String, lowercase: true }
  }, { versionKey: false }
);

module.exports = Odds = model("betapi_sports", betapiSportsSchema);
