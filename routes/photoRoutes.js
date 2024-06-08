const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photoUserController");
const multer = require("multer");
const upload = multer({ dest: "upload" });

router.get("/", photoController.photoGetAll);
router.post("/photo", upload.single("photo"), photoController.uploadPhoto);
module.exports = router;
