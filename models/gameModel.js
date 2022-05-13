const { Schema, model } = require("mongoose");
const Slip = require("./betModel");

const gameSchema = Schema(
  {
    slips: [{ type: Schema.objectId, ref: "Slip" }],
    homa_odd: Number,
    away_odd: Number,
    draw_odd: Number,
    date: Date,
    home_score: Number,
    away_score: Number,
    isFinished: false,
  },
  { toJSON: { vurtials: true }, toObject: { vurtials: true } }
);

gameSchema.static.updateSlipstatus = async function (slipsId) {
  const state = await this.aggregate([
    {
      $match: { slips: { $in: slipsId }, isFinished: { $ne: false } },
    },
    {
      $group: {
        _id: "$slips",
        setStatus: true,
      },
    },
  ]);

  if (state.length > 0) {
    const allbets = await Slip.find(slipsId);
    allslips.map((slip) => {
      slip.isOpen = state[0].setStatus;
      slip.save();
    });
  }
};

gameSchema.post("save", function () {
  this.constructor.updateSlipstatus(this.slips);
});

gameSchema.pre(/^findOneAnd/, async function (next) {
  this.constructor.updateSlipstatus(this.slips);
  next();
});

gameSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.updateSlipstatus(this.r.slips);
});

module.exports = model("Game", gameSchema);
