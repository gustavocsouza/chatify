import express from 'express';

import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { protectRoute } from '../middleware/auth.middleware.js';

import {
  accept,
  deleteContact,
  getAllContacts,
  getChatPartners,
  getInvitationRequests,
  getMessagesByUserId,
  invite,
  sendMessage
} from '../controllers/message.controller.js';

const router = express.Router();

// the middleware execute in order - so requests get rate-limit first, then authenticated.
// this is actually more efficient since unauthenticated 
// requests get blocked by rate limiting before hitting the auth middleware
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/delete-contact", deleteContact);
router.get("/chats", getChatPartners);

router.post("/invite", invite);
router.post("/accept", accept);
router.get("/requests", getInvitationRequests);

router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);





export default router;