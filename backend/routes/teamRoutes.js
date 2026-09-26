import express from "express";

import {
    createTeam,
    getMyTeams,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    makeMemberAdmin,
    removeAdminRole,

    createTeamInvitation,
    getTeamInvitations,
    getTeamInvitationByToken,
    deactivateTeamInvitation,

    createTeamJoinRequest,
    getTeamJoinRequests,
    approveTeamJoinRequest,
    rejectTeamJoinRequest

} from "../controllers/teamController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// CREATE TEAM
// ======================================================

router.post(
    "/",
    authenticate,
    createTeam
);


// ======================================================
// GET MY TEAMS
// ======================================================

router.get(
    "/",
    authenticate,
    getMyTeams
);


// ======================================================
// GET TEAM MEMBERS
// ======================================================

router.get(
    "/:teamId/members",
    authenticate,
    getTeamMembers
);


// ======================================================
// ADD MEMBER
// Owner + Admin
// ======================================================

router.post(
    "/:teamId/add-member",
    authenticate,
    addTeamMember
);


// ======================================================
// REMOVE MEMBER
// Owner + Admin
// ======================================================

router.delete(
    "/:teamId/remove-member/:userId",
    authenticate,
    removeTeamMember
);


// ======================================================
// MAKE MEMBER ADMIN
// Owner ONLY
// ======================================================

router.patch(
    "/:teamId/make-admin",
    authenticate,
    makeMemberAdmin
);


// ======================================================
// REMOVE ADMIN ROLE
// Owner ONLY
// ======================================================

router.patch(
    "/:teamId/remove-admin",
    authenticate,
    removeAdminRole
);


// ======================================================
// CREATE TEAM INVITATION
// Owner + Admin
// ======================================================

router.post(
    "/:teamId/invitations",
    authenticate,
    createTeamInvitation
);


// ======================================================
// GET TEAM INVITATIONS
// Owner + Admin
// ======================================================

router.get(
    "/:teamId/invitations",
    authenticate,
    getTeamInvitations
);


// ======================================================
// DEACTIVATE TEAM INVITATION
// Owner + Admin
// ======================================================

router.delete(
    "/:teamId/invitations/:invitationId",
    authenticate,
    deactivateTeamInvitation
);


// ======================================================
// GET INVITATION BY TOKEN
// Public
// ======================================================

router.get(
    "/invite/:token",
    getTeamInvitationByToken
);


// ======================================================
// CREATE JOIN REQUEST USING INVITE
// Authenticated user
// ======================================================

router.post(
    "/invite/:token/join",
    authenticate,
    createTeamJoinRequest
);


// ======================================================
// GET TEAM JOIN REQUESTS
// Owner + Admin
// ======================================================

router.get(
    "/:teamId/join-requests",
    authenticate,
    getTeamJoinRequests
);


// ======================================================
// APPROVE JOIN REQUEST
// Owner + Admin
// ======================================================

router.patch(
    "/:teamId/join-requests/:requestId/approve",
    authenticate,
    approveTeamJoinRequest
);


// ======================================================
// REJECT JOIN REQUEST
// Owner + Admin
// ======================================================

router.patch(
    "/:teamId/join-requests/:requestId/reject",
    authenticate,
    rejectTeamJoinRequest
);


export default router;