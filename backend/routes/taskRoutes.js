import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createTask,
    getTasksByProject,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTeamTasksController
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", authenticate, createTask);
router.get(
    "/project/:projectId",
    authenticate,
    getTasksByProject
);
router.patch(
    "/:taskId/status",
    authenticate,
    updateTaskStatus
);
router.put(
    "/:taskId",
    authenticate,
    updateTask
);
router.delete(
    "/:taskId",
    authenticate,
    deleteTask
);

router.get(
    "/team/:teamId",
    authenticate,
    getTeamTasksController
);

export default router;