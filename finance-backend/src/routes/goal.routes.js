const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goal.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, goalController.createGoal);
router.get("/", authMiddleware, goalController.getGoals);
router.put("/:id", authMiddleware, goalController.updateGoal);
router.post("/:id/contribute", authMiddleware, goalController.addContribution);
router.delete("/:id", authMiddleware, goalController.deleteGoal);

module.exports = router;
