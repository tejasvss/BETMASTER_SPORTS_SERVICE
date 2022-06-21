const { Schema, model } = require("mongoose");

const liveSports = Schema(
  {
    category: {
      type: String,
      enum: ["InPlay", "PreMatch"],
    },
    sportId: Number,
    isLive: { type: Boolean, default: false },
  },

  { timestamps: true }
);

module.exports = Odds = model("LiveSports", liveSports);
