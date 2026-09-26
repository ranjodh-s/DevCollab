import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getNotifications
);

router.patch(
    "/:id/read",
    authenticate,
    markNotificationRead
);

router.patch(
    "/read-all",
    authenticate,
    markAllNotificationsRead
);

export default router;