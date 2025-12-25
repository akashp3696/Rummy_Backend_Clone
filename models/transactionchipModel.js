const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameType:{
        type:String, 
        enum:["point","pool", "deal"]
    },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const TransactionChip = mongoose.model('TransactionChip', transactionSchema);

module.exports = TransactionChip;
