const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../middleware/Cloudinary");
require("dotenv").config();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports.sendOTP = asyncHandler(async (req, res) => {
    try {
        let { mobile, referralCode } = req.body;
        if (!mobile) {
            return response.validationError(res, "Mobile number is a mandatory field.");
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        let user = await User.findOne({ mobile });

        if (user) {
            user.otp = hashedOTP;
            user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
            await user.save();
        } else {
            if (referralCode) {
                // Ensure referral code format is valid
                referralCode=referralCode.toUpperCase()
                const isValidFormat = /^[A-Z]{8}$/.test(referralCode);
                if (!isValidFormat) {
                    return response.validationError(res, "Referral code must be 8 characters long and contain only uppercase letters.");
                }

                // Check if the referral code exists in the database
                const referrer = await User.findOne({ referralCode });
                if (!referrer) {
                    return response.validationError(res, "Invalid referral code.");
                }
                user = new User({
                    mobile,
                    otp: hashedOTP,
                    otpExpires: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
                    referredBy: referralCode ? referralCode : undefined 
                });

                referrer.referralBonus += 50;
                user.referralBonus += 50; 
                referrer.referredUsers.push(user._id)
                await referrer.save();
                await user.save();
            }
        }
        response.successResponse(res, user, "OTP sent successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.loginWithOTP = asyncHandler(async (req, res) => {
    try {
        let { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return response.validationError(res, "Mobile number and OTP are mandatory fields.");
        }
        const user = await User.findOne({ mobile });
        if (!user) {
            return response.validationError(res, "User not found with the provided mobile number.");
        }
        if (user.otpExpires < new Date()) {
            return response.validationError(res, "OTP has expired. Please request a new OTP.");
        }
        // const isOtpValid = await bcrypt.compare(otp, user.otp);
        // if (!isOtpValid) {
        //     return response.validationError(res, "Invalid OTP.");
        // }
        if (otp != 1234) {
            return response.validationError(res, "Invalid OTP.");
        }
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET);
        response.successResponse(res, { user, token }, "User authenticated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;

        // Extract fields to be updated from the request body and trim them
        const { email, firstName, lastName, address, gender, dob } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        // If user is not found, return error
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }

        // Update user fields with trimmed data
        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();
        if (gender) user.gender = gender.trim();
        if (dob) user.dob = dob;
        if (email) user.email = email.trim();
        if (address) user.address = address
        // if (aadharNo) user.aadharNo = aadharNo.trim();
        // if (panNo) user.panNo = panNo.trim();

        // Save the updated user
        await user.save();

        // Send success response
        response.successResponse(res, user, "User information updated successfully.");
    } catch (error) {
        // Handle errors
        response.internalServerError(res, error.message);
    }
});


module.exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    response.successResponse(res, users, "All users fetched successfully.");
});

// Get user by ID
module.exports.getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return response.notFoundError(res, "User not found.");
    }
    response.successResponse(res, user, "User fetched successfully.");
});


module.exports.uploadDocument = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        const { panNo, aadharNo } = req.body
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }
        if (req.files['pan'] && req.files['pan'].length > 0) {
            if (!panNo) {
                return response.validationError(res, "Pan Number is Required.")
            }
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(panNo) || panNo.length !== 10) {
                return response.validationError(res, "Invalid PAN Number. Please enter a valid 10-character PAN number.");
            }
            const existingPanUser = await User.findOne({ panNo: panNo, _id: { $ne: userId } });
            if (existingPanUser) {
                return response.validationError(res, "PAN Number already exists in another account.");
            }
            const panImageUrl = await uploadOnCloudinary(req.files['pan'][0]);
            user.pan = panImageUrl;
            user.panNo = panNo;
            user.panUploaded = true;
        }
        if (req.files['aadharFront'] && req.files['aadharFront'].length > 0 && req.files['aadharBack'] && req.files['aadharBack'].length > 0) {
            if (!aadharNo) {
                return response.validationError(res, "Addhar Number is Required.")
            }
            const aadharRegex = /^[0-9]{12}$/;
            if (!aadharRegex.test(aadharNo) || aadharNo.length !== 12) {
                return response.validationError(res, "Invalid Aadhaar Number. Please enter a valid 12-digit Aadhaar number.");
            }
            const existingAadharUser = await User.findOne({ aadharNo: aadharNo, _id: { $ne: userId } });
            if (existingAadharUser) {
                return response.validationError(res, "Aadhaar Number already exists in another account.");
            }
            user.aadharFront = await uploadOnCloudinary(req.files["aadharFront"][0])
            user.aadharBack = await uploadOnCloudinary(req.files["aadharBack"][0])
            user.aadharNo = aadharNo;
            user.aadharUploaded = true;
        }
        // if (req.files['aadhar'] && req.files['aadhar'].length > 0) {
        //     const aadharImageUrls = await Promise.all(
        //         req.files['aadhar'].map(async (file) => {
        //             return await uploadOnCloudinary(file);
        //         })
        //     );
        //     user.aadhar = aadharImageUrls;
        //     user.aadharUploaded = true;
        // }
        if (user.panUploaded || user.aadharUploaded) {
            user.isKyc = "pending";
        }
        await user.save();
        response.successResponse(res, user, 'Documents uploaded successfully');
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

module.exports.updateKYCStatus = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { status, doctype } = req.body;

        // Check if status is valid
        if (!['approve', 'rejected'].includes(status)) {
            return response.validationError(res, 'Invalid KYC status');
        }
        if (!['pancard', 'aadharcard'].includes(doctype)) {
            return response.validationError(res, 'Invalid DocType');
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, 'User not found');
        }

        // Update KYC status
        if (status == "rejected") {
            user.aadharUploaded = false;
            user.panUploaded = false;
            user.panVerify = false;
            user.aadharVerify = false;
        }
        if (doctype == "pancard") {
            user.panVerify = true;
        }
        if (doctype == "aadharcard") {
            user.aadharVerify = true;
        }
        user.isKyc = status;
        await user.save();

        response.successResponse(res, user, `KYC status updated to ${status}`);
    } catch (error) {
        response.internalServerError(res, error.message);
    }
};


module.exports.getUsersByKYCStatus = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // Check if status is provided
        if (status && ['approve', 'rejected', 'pending', 'notsubmitted'].includes(status)) {
            query.isKyc = status;
        }

        // Find users based on query
        const users = await User.find(query);

        response.successResponse(res, users, 'Users found successfully');
    } catch (error) {
        response.internalServerError(res, error.message);
    }
};


module.exports.uploadProfilePic = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }

        if (!req.file) {
            return response.validationError(res, "Profile Image Required.")
        }

        user.profileImg = await uploadOnCloudinary(req.file)
        await user.save()
        response.successResponse(res, user, "Profile Image Upload Successfully.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})


module.exports.updateAccount= asyncHandler(async(req, res)=>{
    try {
        const userId = req.userId;
        const {accountDetail, upiId} = req.body
        const user = await User.findById(userId);
        if (!user) {
            return response.notFoundError(res, "User not found.");
        }
        if(accountDetail) user.accountDetail= accountDetail
        if(upiId) user.upiId= upiId
        await user.save()
        response.successResponse(res, user, "Account Detailed Update Successfully.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})


const generateReferralCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};



module.exports.generateReferralCode = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return response.validationError(res, "User ID is a mandatory field.");
        }

        let user = await User.findById(userId);
        if (!user) {
            return response.validationError(res, "User not found.");
        }

        // Check if referral code already exists for the user
        if (user.referralCode) {
            return response.successResponse(res, { referralCode: user.referralCode }, "Referral code already exists.");
        }

        // Generate a unique referral code
        let referralCode;
        let isUnique = false;
        
        // Ensure referral code is unique
        do {
            referralCode = generateReferralCode();
            const existingUser = await User.findOne({ referralCode });
            if (!existingUser) {
                isUnique = true;
            }
        } while (!isUnique);

        // Save referral code to the user document
        user.referralCode = referralCode;
        await user.save();

        response.successResponse(res, { referralCode: user.referralCode }, "Referral code generated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.checkReferralCode = asyncHandler(async (req, res) => {
    try {
        // Get the referral code from query parameters
        let { referralCode } = req.query;
        if (!referralCode) {
            return response.validationError(res, "Referral code is required.");
        }

        // Trim and validate the referral code format
        referralCode = referralCode.toUpperCase();
        referralCode = referralCode.trim();
        const isValidFormat = /^[A-Z]{8}$/.test(referralCode);
        if (!isValidFormat) {
            return response.validationError(res, "Referral code must be 8 characters long and contain only uppercase letters.");
        }
        const user = await User.findOne({ referralCode });
        if (!user) {
            return response.validationError(res, "Invalid referral code.");
        }
        response.successResponse(res, { referralCode }, "Referral code is valid.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});
