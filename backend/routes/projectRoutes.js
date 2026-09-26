import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createProject,
    getProjectsByTeam,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    getMembers,
    updateMemberRole,
    leaveProject,
    getMyProjectChatsController
} from "../controllers/projectController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    createProject
);
router.get(
    "/team/:teamId",
    authenticate,
    getProjectsByTeam
);
router.put(
    "/:projectId",
    authenticate,
    updateProject
);
router.delete(
    "/:projectId",
    authenticate,
    deleteProject
);
router.post(
    "/:projectId/members/:userId",
    authenticate,
    addMember
);
router.delete(
    "/:projectId/members/me",
    authenticate,
    leaveProject
);
router.delete(
    "/:projectId/members/:userId",
    authenticate,
    removeMember
);
router.get(
    "/:projectId/members",
    authenticate,
    getMembers
);
router.patch(
    "/:projectId/members/:userId/role",
    authenticate,
    updateMemberRole
);

router.get(
    "/team/:teamId/chats",
    authenticate,
    getMyProjectChatsController
);


export default router;