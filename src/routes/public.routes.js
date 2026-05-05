const express = require("express");
const publicController = require("@/controllers/public.controller");

const router = express.Router();

router.get("/landing/summary", publicController.getLandingSummary);

module.exports = router;
