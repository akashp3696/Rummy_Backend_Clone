const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const User = require("../models/userModel");
const AddFund = require("../models/addFundModel"); // Import the AddFund model
require("dotenv").config();

const GST_PERCENTAGE = 28; // 28% GST

module.exports.addFund = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId; // Get userId from request object
        const { amount } = req.body;

        if (!amount) {
            return response.validationError(res, "Amount is a mandatory field.");
        }

        const user = await User.findById(userId);
        if (!user) {
            return response.validationError(res, "User not found.");
        }

        // Calculate GST and final amount
        const gstAmount = Number(((Number(amount) * 28) / 128).toFixed(2));
        const totalAmount = Number((Number(amount) - gstAmount).toFixed(2));


        // Create a new AddFund record
        const addFund = new AddFund({
            userId,
            amount,
            discountCredit: gstAmount,
            gstAmount,
            totalAmount: totalAmount
        });

        await addFund.save();

        // Update the user's balance and discount credit
        user.balance += Number(totalAmount);
        user.discountCredit += Number(gstAmount);
        await user.save();

        response.successResponse(res, { addFund, user }, "Fund added successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getFundsByUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId; // Get userId from request object

        const funds = await AddFund.find({ userId }).sort({ createdAt: -1 });

        if (!funds || funds.length === 0) {
            return response.successResponse(res, [], "No funds found for this user.");
        }

        response.successResponse(res, funds, "Funds retrieved successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

module.exports.getUserFundsbyAdmin = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from request object

        const funds = await AddFund.find({ userId }).sort({ createdAt: -1 });

        if (!funds || funds.length === 0) {
            return response.successResponse(res, [], "No funds found for this user.");
        }

        response.successResponse(res, funds, "Funds retrieved successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

module.exports.getAllFunds = asyncHandler(async (req, res) => {
    try {
        const funds = await AddFund.find().populate('userId', '_id mobile firstName lastName email').sort({ createdAt: -1 });

        if (!funds || funds.length === 0) {
            return response.successResponse(res, [], "No funds found.");
        }

        response.successResponse(res, funds, "All funds retrieved successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});