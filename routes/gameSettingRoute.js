const router = require("express").Router()
const { checkAdmin, checkLogin } = require("../middleware/authMiddleware")
const gamesetting = require("../controller/gameSettingController")

router.post('/create',  gamesetting.createGameSetting)
router.get('/all', gamesetting.getGameSettings)
router.put('/update/:id',  gamesetting.updateGameSetting)
router.get('/status-update/:id', gamesetting.toggleGameSettingStatus)
router.delete('/delete/:id', gamesetting.deleteGameSetting)
router.get('/single/:id', gamesetting.getSingleById)


module.exports = router;