import express from "express";

import {
    requestToJoinTeamController,
    getTeamJoinRequestsController,
    approveJoinRequestController,
    rejectJoinRequestController
} from "../controllers/teamJoinRequestController.js";

import {authenticate} from "../middleware/authMiddleware.js";


const router = express.Router();


// User requests to join
router.post(
    "/team-invitations/:token/join",
    authenticate,
    requestToJoinTeamController
);


// Admin views requests
router.get(
    "/teams/:teamId/join-requests",
    authenticate,
    getTeamJoinRequestsController
);


// Admin approves
router.patch(
    "/teams/:teamId/join-requests/:requestId/approve",
    authenticate,
    approveJoinRequestController
);


// Admin rejects
router.patch(
    "/teams/:teamId/join-requests/:requestId/reject",
    authenticate,
    rejectJoinRequestController
);


export default router;