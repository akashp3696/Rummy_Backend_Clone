const router = require("express").Router()
const admin = require("../controller/adminController")

router.post("/create", admin.createAdmin)
router.post("/login", admin.adminLogin)
router.get("/all/count", admin.allCount)

module.exports = router
