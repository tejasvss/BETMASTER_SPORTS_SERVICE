const { Schema, model } = require("mongoose");

const slipSchema = Schema(
  {
    userId: {
      type: Schema.objectId,
      ref: "User",
    },
    games: [
      {
        type: Schema.objectId,
        ref: "Game",
      },
    ],
    bet: {
      type: Schema.objectId,
      ref: "Bet",
    },
    betAmount: {
      type: Number,
      required: [true, "you need to set Amount"],
      validate: {
        validator: function (val) {
          // grate than 1$
          return val > 1;
        },
        message: "the min to bet is 1$",
      },
    },
    userPayout: {
      type: Number,
    },
    isOpen: Boolean,
  },
  { toJSON: { vurtials: true }, toObject: { vurtials: true } }
);
module.exports = model("Slip", slipSchema);
