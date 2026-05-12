const express = require("express");
const router = express.Router();

const recurringController = require("../controllers/recurring.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, recurringController.createRecurring);
router.get("/", authMiddleware, recurringController.getRecurring);
router.put("/:id", authMiddleware, recurringController.updateRecurring);
router.delete("/:id", authMiddleware, recurringController.deleteRecurring);

module.exports = router;
