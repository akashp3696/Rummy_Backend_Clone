const mongoose = require("mongoose");

const gameSettingSchema = new mongoose.Schema({
    gameType: {
        type: String,
        enum: ["cash", "practice"],
        required: true,
    },
    gameName: {
        type: String,
        enum: ["Point", "Deal", "101pool", "201pool", "61pool"],
        required: true,
    },
    variant: {
        type: String,
        enum: ["2_player", "6_player", "1_deal", "2_deal", "3_deal"],
        required: true,
    },
    entryFee: {
        type: Number,
        required: true,
    },
    gamePoint: {
        type: Number,
    },
    maxPlayers: {
        type: Number,
        required: true,
    },
    status:{
        type:Boolean,
        default:true
    },

});


const GameSetting = mongoose.model("GameSetting", gameSettingSchema);

module.exports = GameSetting;
