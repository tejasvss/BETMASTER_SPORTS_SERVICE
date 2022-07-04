const { Schema, model } = require("mongoose");

const oddSetting = Schema(
  {
    fixtureId: {
      type: Number,
      required: [true, "You Must Provide Event ID!"],
      index: true,
    },
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
    marginTotal1: {
      type: Number,
      default: 1,
    },
    marginTotal2: {
      type: Number,
      default: 1,
    },
    marginBothTeamsToScore: {
      type: Number,
      default: 1,
    },
    marginEvenOdd: {
      type: Number,
      default: 1,
    },
    marginEvenOdd: {
      type: Number,
      default: 1,
    },
    marginNextGoal: {
      type: Number,
      default: 1,
    },
    marginTeamWins: {
      type: Number,
      default: 1,
    },
    marginIndividualTotalRuns: {
      type: Number,
      default: 1,
    },
    marginIndividualTotal2Even: {
      type: Number,
      default: 1,
    },
    marginIndividualTotalRunsOvers: {
      type: Number,
      default: 1,
    },
    marginIndividualTotalRunsEvenOddOvers: {
      type: Number,
      default: 1,
    },
    marginDraw: {
      type: Number,
      default: 1,
    },
    marginTeam1ResultTotal: {
      type: Number,
      default: 1,
    },
    marginTeam2ResultTotal: {
      type: Number,
      default: 1,
    },
    marginTieBreaks: {
      type: Number,
      default: 1,
    },
    marginTotalTieBreaks: {
      type: Number,
      default: 1,
    },
    marginTotalSets: {
      type: Number,
      default: 1,
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

  { timestamps: true, strict: false }
);

module.exports = Odds = model("OddSetting", oddSetting);
