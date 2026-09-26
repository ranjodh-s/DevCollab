import express from "express";

import {
    getProjectActivity,
    getTeamActivity
} from "../controllers/activityController.js";

import {
    authenticate
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// PROJECT ACTIVITY
// ======================================================

router.get(
    "/project/:projectId",
    authenticate,
    getProjectActivity
);


// ======================================================
// TEAM ACTIVITY
// ======================================================

router.get(
    "/team/:teamId",
    authenticate,
    getTeamActivity
);


export default router;