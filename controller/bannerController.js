const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Banner = require("../models/bannerModel");
const { uploadOnCloudinary } = require("../middleware/Cloudinary");

module.exports.createBanner = asyncHandler(async (req, res) => {
    try {
        const { title, content, published } = req.body;

        if (!title || !content ) {
            return response.validationError(res, "Title, content are mandatory fields.");
        }

        let imageUrl;
        if (req.file) {
            imageUrl = await uploadOnCloudinary(req.file);
        } else {
            return response.validationError(res, "Image is required for Banner creation.");
        }

        const newBanner = new Banner({
            title,
            content,
            image: imageUrl,
            published: published || false,
            publishedAt: published ? new Date() : null
        });

        const savedBanner = await newBanner.save();
        response.successResponse(res, savedBanner, "Banner created successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateBanner = asyncHandler(async (req, res) => {
    try {
        const BannerId = req.params.id;
        const { title, content, published } = req.body;

        const updatedData = {};
        if (title) updatedData.title = title;
        if (content) updatedData.content = content;
        if (published !== undefined) updatedData.published = published;
        if (published) updatedData.publishedAt = new Date();

        if (req.file) {
            updatedData.image = await uploadOnCloudinary(req.file);
        }

        const updatedBanner = await Banner.findByIdAndUpdate(BannerId, updatedData, { new: true });

        if (!updatedBanner) {
            return response.validationError(res, "Banner not found with the provided ID.");
        }

        response.successResponse(res, updatedBanner, "Banner updated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getAllBanners = asyncHandler(async (req, res) => {
    try {
        const Banners = await Banner.find(); // Fetch all Banners
        response.successResponse(res, Banners, "All Banners retrieved successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getSingleBanner = asyncHandler(async (req, res) => {
    try {
        const BannerId = req.params.id;
        const banner = await Banner.findById(BannerId);

        if (!banner) {
            return response.validationError(res, "Banner not found with the provided ID.");
        }

        response.successResponse(res, banner, "Banner retrieved successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.deleteBanner = asyncHandler(async (req, res) => {
    try {
        const BannerId = req.params.id;
        const deletedBanner = await Banner.findByIdAndDelete(BannerId);

        if (!deletedBanner) {
            return response.validationError(res, "Banner not found with the provided ID.");
        }

        response.successResponse(res, deletedBanner, "Banner deleted successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});



