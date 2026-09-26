import {
    getProjectActivityService,
    getTeamActivityService
} from "../services/activityService.js";


// ======================================================
// GET PROJECT ACTIVITY
// ======================================================

export const getProjectActivity = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } = req.params;

        const activities =
            await getProjectActivityService(
                projectId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            activities
        });

    }
    catch (err) {

        next(err);

    }

};


// ======================================================
// GET TEAM ACTIVITY
// ======================================================

export const getTeamActivity = async (
    req,
    res,
    next
) => {

    try {

        const { teamId } = req.params;

        const activities =
            await getTeamActivityService(
                teamId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            activities
        });

    }
    catch (err) {

        next(err);

    }

};