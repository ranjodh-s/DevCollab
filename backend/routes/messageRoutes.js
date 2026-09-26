import express from "express";

import { authenticate } from "../middleware/authMiddleware.js";

import {
    createMessage,
    getTeamMessages,
    updateMessage,
    createReply,
    getReplies
} from "../controllers/messageController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    createMessage
);

router.post(
    "/reply",
    authenticate,
    createReply
);

router.get(
    "/:messageId/replies",
    authenticate,
    getReplies
);

router.get(
    "/team/:teamId",
    authenticate,
    getTeamMessages
);

router.put(
    "/:messageId",
    authenticate,
    updateMessage
);

router.delete(
    "/:messageId",
    authenticate,
    deleteMessage
);





export default router;