const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool'},
    pointId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    gameId: { type: mongoose.Schema.Types.ObjectId },
    gameType: {
        type: String,
        enum: ["point", "pool", "deal"]
    },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    createdAt: { type: Date, default: Date.now },
    discountCreditUsed: { type: Number, default: 0 },
    balanceUsed: { type: Number, default: 0 },
    withdrawalableBalanceUsed: { type: Number, default: 0 },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
