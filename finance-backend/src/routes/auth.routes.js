console.log("AUTH ROUTES STEP 1");

const express = require("express");
console.log("AUTH ROUTES STEP 2");

const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
console.log("AUTH ROUTES STEP 3");

router.post("/login", authController.login);
console.log("AUTH ROUTES STEP 4");

module.exports = router;