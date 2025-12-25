const { AllPoint, AllPool, AllDeal } = require("../controller/allgameController")

const router = require("express").Router()



router.get("/point", AllPoint)
router.get("/pool", AllPool)
router.get("/deal", AllDeal)


module.exports = router;