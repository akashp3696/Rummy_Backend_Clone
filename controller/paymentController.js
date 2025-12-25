const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel")


module.exports.createPayment = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const { amount } = req.body;
        if(!amount){
            return response.validationError(res, "Amount is required.")
        }
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }
        const newPayment = new Payment({ userId, amount, status: 'completed'});
        user.balance = Number(user.balance) + Number(amount);
        
        const savedPayment = await newPayment.save();
        await user.save();
        response.successResponse(res, savedPayment, "Payment created successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


// Update a payment
module.exports.updatePayment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, status } = req.body;
        const updatedPayment = await Payment.findByIdAndUpdate(id, { amount, status }, { new: true });
        if (!updatedPayment) {
            return response.notFoundError(res, "Payment not found.");
        }
        response.successResponse(res, updatedPayment, "Payment updated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Delete a payment
module.exports.deletePayment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        if (!payment) {
            return response.notFoundError(res, "Payment not found.");
        }
        if (payment.status === 'completed') {
            const user = await User.findById(payment.userId);
            if (!user) {
                return response.notFoundError(res, "User not found.");
            }
            user.balance = Number(user.balance) - Number(payment.amount);
            await user.save();
        }
        await Payment.findByIdAndDelete(id);
        response.successResponse(res, null, "Payment deleted successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


// Get all payments
module.exports.getAllPayments = asyncHandler(async (req, res) => {
    try {
        const payments = await Payment.find().populate("userId");
        response.successResponse(res, payments, "All payments fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Get payment by ID
module.exports.getPaymentById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        if (!payment) {
            return response.notFoundError(res, "Payment not found.");
        }
        response.successResponse(res, payment, "Payment fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getPaymentsByUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const payments = await Payment.find({ userId });
        response.successResponse(res, payments, "All payments fetched successfully for the user.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});