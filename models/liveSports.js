const { Schema, model } = require("mongoose");

const liveSports = Schema(
  {
    category: {
      type: String,
      enum: ["InPlay", "PreMatch"],
    },
    live: [Number],
  },

  { timestamps: true }
);

module.exports = Odds = model("LiveSports", liveSports);
