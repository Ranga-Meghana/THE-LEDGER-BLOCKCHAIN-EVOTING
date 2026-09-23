const express = require("express");
const router = express.Router();
const controller = require("../controllers/electionController");

router.get("/", controller.listElections);
router.get("/:id", controller.getElection);
router.post("/", controller.createElection);
router.patch("/:id/status", controller.updateStatus);

module.exports = router;
