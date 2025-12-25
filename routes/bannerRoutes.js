const express = require("express");
const { createBanner, updateBanner, getAllBanners, getSingleBanner, deleteBanner } = require("../controller/bannerController");
const upload = require("../middleware/Multer");

const router = express.Router();

router.post("/create", upload.single("image"), createBanner);
router.put("/update/:id", upload.single("image"), updateBanner);
router.get("/all", getAllBanners);
router.get("/single/:id", getSingleBanner);
router.delete("/delete/:id", deleteBanner);

module.exports = router;
