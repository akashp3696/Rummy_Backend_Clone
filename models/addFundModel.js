const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addFundSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    discountCredit: {
        type: Number,
        default: 0
    },
    gstAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

const AddFund = mongoose.model('AddFund', addFundSchema);

module.exports = AddFund;
