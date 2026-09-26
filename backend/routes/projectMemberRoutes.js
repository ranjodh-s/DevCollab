import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";

import {
    getProjectMembers,
    addProjectMember,
    updateProjectMemberRole,
    leaveProject,
    removeProjectMember
} from "../controllers/projectMemberController.js";

const router = express.Router();

router.get(
    "/:projectId/members",
    authenticate,
    getProjectMembers
);

router.post(
    "/:projectId/members/:userId",
    authenticate,
    addProjectMember
);

router.patch(
    "/:projectId/members/:userId/role",
    authenticate,
    updateProjectMemberRole
);

router.delete(
    "/:projectId/members/me",
    authenticate,
    leaveProject
);

router.delete(
    "/:projectId/members/:userId",
    authenticate,
    removeProjectMember
);

export default router;