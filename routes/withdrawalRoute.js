const router = require("express").Router()
const withdrawal = require("../controller/withdrawalController")
const { checkLogin, checkAdmin } = require("../middleware/authMiddleware")


router.post("/create", checkLogin, withdrawal.createWithdrawal)
router.put("/mark-complete/:id", checkAdmin, withdrawal.updateWithdrawalStatus)
router.delete("/:id", checkAdmin, withdrawal.deleteWithdrawal)
router.get("/all", checkAdmin, withdrawal.getAllWithdrawals)
router.get("/single/:id", withdrawal.getWithdrawalById)
router.post("/addbalance", checkLogin, withdrawal.addWithdrawalableBalance)
router.get("/user", checkLogin, withdrawal.getAllWithdrawalsByUserId)
router.get("/admin/user/:userId", checkAdmin, withdrawal.getUserWithdrawalsByAdmin)
router.put("/update/:id", checkLogin, withdrawal.updateWithdrawal)


module.exports = router;