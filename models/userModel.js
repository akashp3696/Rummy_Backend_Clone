const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
    },
    firstName: {
        type: String,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        trim: true,
        lowercase: true
    },
    profileImg: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        aaddress: String,
        city: String,
        state: String,
        pincode: Number
    },
    gender: {
        type: String,
        enum: ['male', 'female', "other"]
    },
    dob: {
        type: Date
    },
    password: {
        type: String,
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    aadhar: [String],
    pan: {
        type: String,
    },
    aadharFront: {
        type: String,
    },
    aadharBack: {
        type: String,
    },
    bonus: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    discountCredit: {
        type: Number,
        default: 0
    },
    withdrawalableBalance: {
        type: Number,
        default: 0
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date
    },
    isKyc: {
        type: String,
        enum: ["notsubmitted", "approve", "pending", "rejected"],
        default: "notsubmitted"
    },
    panUploaded: {
        type: Boolean,
        default: false
    },
    aadharUploaded: {
        type: Boolean,
        default: false
    },
    panVerify: {
        type: Boolean,
        default: false
    },
    aadharVerify: {
        type: Boolean,
        default: false
    },
    panNo: {
        type: String,
    },
    aadharNo: {
        type: Number,
    },
    accountDetail: {
        accountNumber: {
            type: String,
        },
        ifscCode: {
            type: String,
            trim: true,
        },
        bankName: {
            type: String,
            trim: true,
        },
        bankAccountHolderName: {
            type: String,
            trim: true,
        }
    },
    upiId: {
        type: String,
        trim: true,
    },
    referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: String,
        default: null
    },
    referralBonus: {
        type: Number,
        default: 0
    },
    referredUsers: {
        type: [String],
        default: []
    },
    gamechip:{
        type:Number,
        default:10000
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
