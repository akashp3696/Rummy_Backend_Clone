const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Withdrawal = require("../models/withdrawalModel");
const User = require("../models/userModel");


module.exports.createWithdrawal = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const { amount } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }
        if (amount < 100) {
            return response.validationError(res, "Withdrawal amount must be at least 100 INR.");
        }
        if (user.withdrawalableBalance < amount) {
            return response.validationError(res, "Insufficient withdrawalable balance.");
        }
        const tdsAmount = amount * 0.30;
        const finalAmount = amount - tdsAmount;
        const newWithdrawal = new Withdrawal({
            userId,
            amount: finalAmount,
            tds: tdsAmount,
            status: 'approved',
            requestamt: amount
        });
        const savedWithdrawal = await newWithdrawal.save();
        user.withdrawalableBalance = Number(user.withdrawalableBalance) - Number(amount);
        await user.save();
        response.successResponse(res, savedWithdrawal, "Withdrawal created successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateWithdrawalStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return response.notFoundError(res, "Withdrawal not found.");
        }
        if (status != 'approved' && status != 'rejected') {
            return response.validationError(res, "Invalid status provided.");
        }
        if (status === 'approved') {
            const user = await User.findById(withdrawal.userId);
            if (!user) {
                return response.notFoundError(res, "User not found.");
            }
            user.withdrawalableBalance = Number(user.withdrawalableBalance) - Number(withdrawal.amount);
            await user.save();
        }
        withdrawal.status = status;
        const updatedWithdrawal = await withdrawal.save();
        response.successResponse(res, updatedWithdrawal, `Withdrawal status updated to ${status} successfully.`);
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Delete a withdrawal
module.exports.deleteWithdrawal = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the withdrawal
        const deletedWithdrawal = await Withdrawal.findByIdAndDelete(id);
        if (!deletedWithdrawal) {
            return response.notFoundError(res, "Withdrawal not found.");
        }

        response.successResponse(res, null, "Withdrawal deleted successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getAllWithdrawals = asyncHandler(async (req, res) => {
    try {
        const { status } = req.query;
        let withdrawals;
        if (status) {
            withdrawals = await Withdrawal.find({ status }).sort({ createdAt: -1 }).populate("userId", "_id mobile firstName lastName email");
        } else {
            withdrawals = await Withdrawal.find().sort({ createdAt: -1 }).populate("userId", "_id mobile firstName lastName email");
        }
        response.successResponse(res, withdrawals, "Withdrawals fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getWithdrawalById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return response.notFoundError(res, "Withdrawal not found.");
        }
        response.successResponse(res, withdrawal, "Withdrawal fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.addWithdrawalableBalance = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const { amount } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }
        user.withdrawalableBalance = Number(user.withdrawalableBalance || 0) + Number(amount)
        await user.save();
        response.successResponse(res, user, "Withdrawalable balance updated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getAllWithdrawalsByUserId = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const withdrawals = await Withdrawal.find({ userId }).sort({createdAt:-1});
        response.successResponse(res, withdrawals, "All withdrawals fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

module.exports.getUserWithdrawalsByAdmin = asyncHandler(async (req, res) => {
    try {
        const {userId} = req.params;
        const withdrawals = await Withdrawal.find({ userId }).sort({createdAt:-1});
        response.successResponse(res, withdrawals, "All withdrawals fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateWithdrawal = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const { status, amount } = req.body;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return response.notFoundError(res, "Withdrawal not found.");
        }
        if (status && !['pending', 'cancelled'].includes(status)) {
            return response.validationError(res, "Invalid status provided.");
        }
        if (withdrawal.status !== 'completed' && withdrawal.status !== 'rejected') {
            // Update the withdrawal status and/or amount if provided
            if (status) {
                withdrawal.status = status;
            }
            if (amount) {
                withdrawal.amount = amount;
            }
            const updatedWithdrawal = await withdrawal.save();
            response.successResponse(res, updatedWithdrawal, "Withdrawal updated successfully.");
        } else {
            return response.validationError(res, "Withdrawal cannot be modified once completed or rejected.");
        }
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});