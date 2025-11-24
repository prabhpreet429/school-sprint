import express from "express";
import { login, register, getCurrentUser, updateCurrentUser, verifyToken, checkAdminExists, createAccount, getPeopleWithoutAccounts, getAllUsers } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // Public - only for admin registration
router.post("/create-account", verifyToken, createAccount); // Protected - admin only
router.get("/people-without-accounts", verifyToken, getPeopleWithoutAccounts); // Protected - admin only
router.get("/users", verifyToken, getAllUsers); // Protected - admin only
router.post("/check-admin", checkAdminExists);
router.get("/me", verifyToken, getCurrentUser);
router.put("/me", verifyToken, updateCurrentUser); // Protected - update own account

export default router;
