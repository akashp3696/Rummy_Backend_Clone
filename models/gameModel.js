const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for a single card
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who is the player
    cards: [CardSchema], // Cards held by the player
    sequences: [{ type: Schema.Types.ObjectId, ref: 'Sequence' }], // Sequences formed by the player
    sets: [{ type: Schema.Types.ObjectId, ref: 'Set' }],
    startCard: CardSchema,
    score:{type:Number, default:0},
    pureSequences: [SequenceSchema], 
    impureSequences: [SequenceSchema], 
    isSets: [SetSchema], 
    invalid: [CardSchema],
    isDrop:{type:Boolean, default:false},
    amount:{type:Number, default:0}
});
// Define schema for the Rummy game
const GameSchema = new Schema({
    players: [PlayerSchema], 
    currentPlayerIndex: { type: Number, default: 0 }, 
    openDeck: [CardSchema], 
    closedDeck: [CardSchema], 
    discardedCards: [CardSchema],
    winner: { type: Schema.Types.ObjectId, ref: 'User', default: null }, 
    isActive: { type: Boolean, default: true },
    isStart: { type: Boolean, default: false },
    point:{type:Number},
    resultpoint:{type:Number, default:0},
    winningAmount:{type:Number, default:0},
    tableType:{type:String, enum:["2_player", "6_player"]},
    joker: String, 
    cardsDistributed: { type: Boolean, default: false }, 
    startCardsAssigned: { type: Boolean, default: false },
}, { timestamps: true });

// Compile the models
const Card = mongoose.model('Card', CardSchema);
const Player = mongoose.model('Player', PlayerSchema);
const Sequence = mongoose.model('Sequence', SequenceSchema);
const Set = mongoose.model('Set', SetSchema);
const Game = mongoose.model('Game', GameSchema);

module.exports = { Card, Player, Sequence, Set, Game };
