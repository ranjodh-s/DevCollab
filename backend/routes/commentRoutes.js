import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createComment,
    getCommentsByTask,
    updateComment,
    deleteComment
} from "../controllers/commentController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    createComment
);

router.get(
    "/task/:taskId",
    authenticate,
    getCommentsByTask
);

router.put(
    "/:commentId",
    authenticate,
    updateComment
);

router.delete(
    "/:commentId",
    authenticate,
    deleteComment
);

export default router;