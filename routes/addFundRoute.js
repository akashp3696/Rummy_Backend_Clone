const router = require("express").Router()
const addFund = require("../controller/addFundController")
const { checkAdmin, checkLogin } = require("../middleware/authMiddleware")


router.post("/add", checkLogin, addFund.addFund)
router.get("/byuser", checkLogin, addFund.getFundsByUser)
router.get("/admin", checkAdmin, addFund.getAllFunds)
router.get("/admin/user/:userId", checkAdmin, addFund.getUserFundsbyAdmin)


module.exports = router;