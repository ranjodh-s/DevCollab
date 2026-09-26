import express from "express";

import {
    getProjectChat,
    getProjectMessages,
    sendMessage,
    editMessage,
    deleteMessage
} from "../controllers/chatController.js";

import {authenticate}
    from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// GET PROJECT CHAT
// ==========================================

router.get(
    "/projects/:projectId/chat",
    authenticate,
    getProjectChat
);


// ==========================================
// GET PROJECT MESSAGES
// ==========================================

router.get(
    "/projects/:projectId/chat/messages",
    authenticate,
    getProjectMessages
);


// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
    "/projects/:projectId/chat/messages",
    authenticate,
    sendMessage
);

// ==========================================
// EDIT MESSAGE
// ==========================================

router.patch(
    "/projects/:projectId/chat/messages/:messageId",
    authenticate,
    editMessage
);


// ==========================================
// DELETE MESSAGE
// ==========================================

router.delete(
    "/projects/:projectId/chat/messages/:messageId",
    authenticate,
    deleteMessage
);


export default router;