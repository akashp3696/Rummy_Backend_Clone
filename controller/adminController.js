const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Admin = require("../models/adminModel");
const User  = require("../models/userModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Admin create
module.exports.createAdmin = asyncHandler(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if (!username || !email || !password) {
            return response.validationError(res, "Username, email, and password are mandatory fields.");
        }
        email = email.toLowerCase(); // Convert email to lowercase
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return response.validationError(res, "Email already registered with an admin account.");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({ username, email, password: hashPassword });
        const savedAdmin = await newAdmin.save();
        response.successResponse(res, savedAdmin, "Admin created successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Admin login
module.exports.adminLogin = asyncHandler(async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return response.validationError(res, "Email and password are mandatory fields.");
        }
        email = email.toLowerCase(); // Convert email to lowercase
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return response.validationError(res, "Admin not found with the provided email.");
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return response.validationError(res, "Invalid password.");
        }
        const token = jwt.sign({ adminId: admin._id }, process.env.JWTSECRET, { expiresIn: "1d" });
        response.successResponse(res, { admin, token }, "Admin authenticated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.allCount = asyncHandler(async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const pendingCount = await User.countDocuments({ isKyc: "pending" });
        const approveCount = await User.countDocuments({ isKyc: "approve" });
        const rejectedCount = await User.countDocuments({ isKyc: "rejected" });
        const notSubmittedCount = await User.countDocuments({ isKyc: "notsubmitted" });

        response.successResponse(res, {
            userCount,
            pendingCount,
            approveCount,
            rejectedCount,
            notSubmittedCount
        }, "All Count Data.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});
