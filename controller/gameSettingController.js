const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const GameSetting = require("../models/gameSettingModel");

module.exports.createGameSetting = asyncHandler(async (req, res) => {
    try {
        const { gameType, gameName, variant, entryFee, gamePoint } = req.body;

        if (!gameType || !gameName || !variant || entryFee === undefined) {
            return response.validationError(res, "gameType, gameName, variant, and entryFee are mandatory fields.");
        }

        if (gameName == "Point" && gamePoint === undefined) {
            return response.validationError(res, "gamePoint can only be set for 'Point' game type.");
        }
        let maxPlayers = variant === "3_deal" || variant === "6_player" ? 6 : 2;
        const newGameSetting = new GameSetting({ gameType, gameName, variant, entryFee, gamePoint, maxPlayers });
        const savedGameSetting = await newGameSetting.save();
        response.successResponse(res, savedGameSetting, "Game setting created successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

module.exports.getGameSettings = asyncHandler(async (req, res) => {
    try {
        const { gameType, gameName, variant, active=true } = req.query;

        const query = {};
        if (gameType) query.gameType = gameType;
        if (gameName) query.gameName = gameName;
        if (variant) query.variant = variant;
        if (active) query.status = active;
        console.log(query, active)
        const gameSettings = await GameSetting.find(query);
        response.successResponse(res, gameSettings, "Game settings fetched successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateGameSetting = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { gameType, gameName, variant, entryFee, gamePoint, status } = req.body;

        // Determine maxPlayers based on variant
        if (!variant) {
            return response.validationError(res, "variant not found.");
        }
        let maxPlayers = variant === "3_deal" || variant === "6_player" ? 6 : 2;

        // Find the existing game setting
        const findSetting = await GameSetting.findById(id);
        if (!findSetting) {
            return response.validationError(res, "Game setting not found.");
        }

        // Validate that gamePoint is provided when gameName is "Point"
        if (gameName === "Point" && (gamePoint === undefined || gamePoint === null)) {
            return response.validationError(res, "gamePoint is required for the 'Point' game type.");
        }

        // Update fields conditionally
        if (gameType) findSetting.gameType = gameType;
        if (gameName) findSetting.gameName = gameName;
        if (variant) findSetting.variant = variant;
        if (entryFee !== undefined) findSetting.entryFee = entryFee;
        if (gamePoint !== undefined) findSetting.gamePoint = gamePoint;
        if (status !== undefined) findSetting.status = status;
        
        // Set maxPlayers
        findSetting.maxPlayers = maxPlayers;

        // Save the updated document
        const updatedGameSetting = await findSetting.save();

        response.successResponse(res, updatedGameSetting, "Game setting updated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});



module.exports.toggleGameSettingStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedGameSetting = await GameSetting.findByIdAndUpdate(
            id,
            { status: active },
            { new: true }
        );

        if (!updatedGameSetting) {
            return response.validationError(res, "Game setting not found.");
        }

        response.successResponse(res, updatedGameSetting, `Game setting ${active ? 'activated' : 'inactivated'} successfully.`);
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Delete Game Setting
module.exports.deleteGameSetting = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const deletedGameSetting = await GameSetting.findByIdAndDelete(id);

        if (!deletedGameSetting) {
            return response.validationError(res, "Game setting not found.");
        }

        response.successResponse(res, deletedGameSetting, "Game setting deleted successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});
module.exports.getSingleById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGameSetting = await GameSetting.findById(id);
        if (!deletedGameSetting) {
            return response.validationError(res, "Game setting not found.");
        }
        response.successResponse(res, deletedGameSetting, "Game Single Data.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});
