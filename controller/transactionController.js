const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Transaction = require("../models/transactionModel")

module.exports.getAllTransactionByUserId = asyncHandler(async(req, res)=>{
     try {
          const userId = req.userId
          console.log(userId);
          const  alltxn = await Transaction.find({userId}).sort({createdAt:-1}).populate("poolId").populate("pointId").populate("dealId")
          response.successResponse(res, alltxn, "All Transaction Details.")
     } catch (error) {
          response.internalServerError(res, error.message)
     }
})


module.exports.getUserTxnByAdmin = asyncHandler(async(req, res)=>{
     try {
          const {userId} = req.params
          const  alltxn = await Transaction.find({userId}).sort({createdAt:-1}).populate("poolId").populate("pointId").populate("dealId")
          response.successResponse(res, alltxn, "All Transaction Details.")
     } catch (error) {
          response.internalServerError(res, error.message)
     }  
})