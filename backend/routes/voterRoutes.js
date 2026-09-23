const express = require("express");
const router = express.Router();
const controller = require("../controllers/voterController");
const { requireFields } = require("../middleware/validate");

router.post("/register", requireFields(["studentId", "fullName", "walletAddress", "electionId"]), controller.registerVoter);
router.get("/:walletAddress/status", controller.getVoterStatus);

module.exports = router;
