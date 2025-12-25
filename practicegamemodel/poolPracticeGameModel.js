const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Card, Sequence, Set } = require("../models/gameModel")

const CardSchema = new Schema({
    suit: { type: String, required: true }, // Suit of the card (e.g., 'hearts', 'diamonds', 'clubs', 'spades')
    rank: { type: String, required: true }, // Rank of the card (e.g., '2', '3', ..., '10', 'J', 'Q', 'K', 'A')
});


// Define schema for a sequence of cards
const SequenceSchema = new Schema({
    cards: [CardSchema], // Cards forming the sequence
    isPure: { type: Boolean, default: false } // Indicates whether the sequence is pure or impure
});

// Define schema for a set of cards
const SetSchema = new Schema({
    cards: [CardSchema] // Cards forming the set
});


// Define schema for a single player
const PlayerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cards: [CardSchema],
    sequences: [{ type: Schema.Types.ObjectId, ref: 'Sequence' }],
    sets: [{ type: Schema.Types.ObjectId, ref: 'Set' }],
    startCard: CardSchema,
    score: { type: Number, default: 0 },
    pureSequences: [SequenceSchema],
    impureSequences: [SequenceSchema],
    isSets: [SetSchema],
    invalid: [CardSchema],
    isDrop: { type: Boolean, default: false },
    currentDealScore: { type: Number, default: 0 },
    eliminated:{type:Boolean, default: false}
});
// Define schema for the Rummy Deal
const PoolSchema = new Schema({
    poolType: { type: String, enum: ["2_player", "6_player"] },
    players: [PlayerSchema],
    currentPlayerIndex: { type: Number, default: 0 },
    openDeck: [CardSchema],
    closedDeck: [CardSchema],
    discardedCards: [CardSchema],
    winner: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
    isActive: { type: Boolean, default: true },
    point: { type: Number },
    tableType: { type: String, enum: ["101_pool", "201_pool", "61_pool"] },
    joker: { type: String, default: null },
    gameScores: [{
        player: { type: Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number },
        currentIndex: { type: Number, default: 0 },
        isWinner: { type: Boolean, default: false }
    }],
    totalPlayer:Number
}, { timestamps: true });

// const Player = mongoose.model('PoolPlayer', PlayerSchema);
const Pool = mongoose.model('PoolPractice', PoolSchema);

module.exports = { Pool };
