const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema, changePasswordSchema } = require("../validations/user.validator");

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put("/change-password", authMiddleware, validate(changePasswordSchema), userController.changePassword);
router.get("/financial-score", authMiddleware, userController.getFinancialScore);

module.exports = router;
