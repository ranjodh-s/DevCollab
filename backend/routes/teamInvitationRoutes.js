import express from "express";

import {
    createInvitationController,
    getTeamInvitationsController,
    deactivateInvitationController,
    getInvitationByTokenController
} from "../controllers/teamInvitationController.js";

import {authenticate} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// TEAM ADMIN INVITATIONS
// ==========================================

// Create invitation
router.post(
    "/teams/:teamId/invitations",
    authenticate,
    createInvitationController
);


// Get team invitations
router.get(
    "/teams/:teamId/invitations",
    authenticate,
    getTeamInvitationsController
);


// Deactivate invitation
router.delete(
    "/teams/:teamId/invitations/:invitationId",
    authenticate,
    deactivateInvitationController
);


// ==========================================
// PUBLIC INVITATION
// ==========================================

// View invitation
router.get(
    "/team-invitations/:token",
    getInvitationByTokenController
);


export default router;