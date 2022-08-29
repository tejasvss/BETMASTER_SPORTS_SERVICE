const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userBetSchema = new mongoose.Schema({

    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    betNumber: { type: Number, unique: true, sparse: true, index: true },
    betType: { type: String, default: 'single' },
    betStatus: { type: String, default: 'inprogress' },
    betsCount: { type: Number, default: 1 },
    sport_name: { type: String },
    sport_id: { type: Number },
    amount: { type: Number },
    game_id: { type: Number },
    game_start: { type: Number },
    tournamentId: { type: Number },
    torunamentName: { type: String },
    oc_group_name: { type: String },
    oc_name: { type: String },
    oc_rate: { type: Number },
    winningAmount: { type: Number }
}, { timestamps: true, versionKey: false });


const UserBets = new mongoose.model("user_bets", userBetSchema);

module.exports = UserBets;