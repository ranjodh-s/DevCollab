import {
    requestToJoinTeam,
    getTeamJoinRequests,
    approveJoinRequest,
    rejectJoinRequest
} from "../services/teamJoinRequestService.js";


export const requestToJoinTeamController = async (
    req,
    res,
    next
) => {

    try {

        const { token } = req.params;

        const result = await requestToJoinTeam(
            token,
            req.user.id
        );


        res.status(201).json({
            success: true,
            message: "Team join request submitted successfully",
            data: {
                request: result.request,
                team: result.team
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getTeamJoinRequestsController = async (
    req,
    res,
    next
) => {

    try {

        const teamId = Number(req.params.teamId);

        const status =
            req.query.status || "Pending";


        const requests = await getTeamJoinRequests(
            teamId,
            req.user.id,
            status
        );


        res.status(200).json({
            success: true,
            data: {
                requests
            }
        });

    } catch (error) {

        next(error);

    }
};

export const approveJoinRequestController = async (
    req,
    res,
    next
) => {

    try {

        const teamId = Number(req.params.teamId);
        const requestId = Number(req.params.requestId);


        const request = await approveJoinRequest(
            teamId,
            requestId,
            req.user.id
        );


        res.status(200).json({
            success: true,
            message: "Join request approved successfully",
            data: {
                request
            }
        });

    } catch (error) {

        next(error);

    }
};

export const rejectJoinRequestController = async (
    req,
    res,
    next
) => {

    try {

        const teamId = Number(req.params.teamId);
        const requestId = Number(req.params.requestId);


        const request = await rejectJoinRequest(
            teamId,
            requestId,
            req.user.id
        );


        res.status(200).json({
            success: true,
            message: "Join request rejected successfully",
            data: {
                request
            }
        });

    } catch (error) {

        next(error);

    }
};