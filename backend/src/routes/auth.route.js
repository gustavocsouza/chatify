import express from 'express';
import { signup, login, logout, updateProfile, invite, accept, getInvitationRequests } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/invite", invite);
router.post("/accept", accept);
router.get("/:userId/requests", getInvitationRequests);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));


export default router;