const router = require("express").Router()
const payment = require("../controller/paymentController")
const { checkLogin, checkAdmin } = require("../middleware/authMiddleware")

router.post("/create", checkLogin, payment.createPayment)
router.put("/:id", checkAdmin, payment.updatePayment)
router.delete("/:id", checkAdmin, payment.deletePayment)
router.get("/all", checkAdmin, payment.getAllPayments)
router.get("/single/:id", payment.getPaymentById)
router.get("/user", checkLogin, payment.getPaymentsByUser)

module.exports = router;
