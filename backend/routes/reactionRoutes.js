import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createOrUpdateReaction,
    deleteReaction,
    getMessageReactions
} from "../controllers/reactionController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    createOrUpdateReaction
);
router.delete(
    "/:messageId",
    authenticate,
    deleteReaction
);
router.get(
    "/message/:messageId",
    authenticate,
    getMessageReactions
);

export default router;