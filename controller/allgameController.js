const {Game:Point} = require("../models/gameModel")
const {Pool} = require("../models/poolModel")
const {Deal} = require("../models/dealModel")
const asyncHandler = require("express-async-handler")
const response = require("../middleware/responseMiddlewares")


module.exports.AllPool = asyncHandler(async (req, res) => {
    try {
        const pool = await Pool.find()
        response.successResponse(res, pool, "All Data.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

module.exports.AllDeal = asyncHandler(async (req, res) => {
    try {
        const pool = await Deal.find()
        response.successResponse(res, pool, "All Data.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

module.exports.AllPoint = asyncHandler(async (req, res) => {
    try {
        const pool = await Point.find()
        response.successResponse(res, pool, "All Data.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

