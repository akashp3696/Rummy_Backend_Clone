const { getAllTransactionByUserId, getUserTxnByAdmin } = require("../controller/transactionController")
const { checkLogin, checkAdmin } = require("../middleware/authMiddleware")

const router = require("express").Router()


router.get("/byuser", checkLogin, getAllTransactionByUserId)
router.get("/admin/byuser/:userId", checkAdmin, getUserTxnByAdmin)


module.exports = router;