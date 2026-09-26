import pool from "../config/db.js";
import {
    createTeamService,
    addTeamMemberService,
    removeTeamMemberService,
    makeMemberAdminService,
    removeAdminRoleService,

    createTeamInvitationService,
    getTeamInvitationsService,
    getTeamInvitationByTokenService,
    deactivateTeamInvitationService,

    createTeamJoinRequestService,
    getTeamJoinRequestsService,
    approveTeamJoinRequestService,
    rejectTeamJoinRequestService

} from "../services/teamService.js";

export const createTeam = async (req, res) => {

    try {

        const { name, description } = req.body;

        const team = await createTeamService(
            name,
            description,
            req.user.id
        );

        res.status(201).json(team);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

}

export const getMyTeams = async (req, res) => {

    try {

        const result = await pool.query(
            `
    SELECT

        t.id,
        t.name,
        t.description,
        tm.role,

        (
            SELECT COUNT(*)
            FROM team_members
            WHERE team_id = t.id
        )::int AS "memberCount",

        (
            SELECT COUNT(*)
            FROM projects
            WHERE team_id = t.id
        )::int AS "projectCount"

    FROM teams t

    JOIN team_members tm
        ON tm.team_id = t.id

    WHERE tm.user_id = $1

    ORDER BY t.created_at DESC
    `,




            [req.user.id]

        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

export const getTeamMembers = async (req, res) => {

    try {

        const { teamId } = req.params;

        // Check that current user belongs to this team
        const accessResult = await pool.query(
            `
            SELECT role
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [teamId, req.user.id]
        );

        if (accessResult.rows.length === 0) {

            return res.status(403).json({
                message: "You are not a member of this team"
            });

        }


        const result = await pool.query(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                tm.role

            FROM team_members tm

            JOIN users u
                ON u.id = tm.user_id

            WHERE tm.team_id = $1

            ORDER BY
                CASE
                    WHEN tm.role = 'Owner' THEN 0
                    WHEN tm.role = 'Admin' THEN 1
                    ELSE 2
                END,
                u.name ASC
            `,
            [teamId]
        );


        return res.json(result.rows);

    } catch (err) {

        console.error(
            "GET TEAM MEMBERS ERROR:",
            err
        );

        return res.status(500).json({
            message: "Failed to load team members"
        });

    }

};

export const addTeamMember = async (
    req,
    res
) => {

    try {

        const { teamId } = req.params;

        const { userId } = req.body;

        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "userId is required"

            });

        }

        const result =
            await addTeamMemberService(
                teamId,
                userId,
                req.user.id
            );

        return res.status(201).json({

            success: true,

            message: "Member added successfully",

            data: result

        });

    } catch (error) {

        console.error("addMember error:", error);

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message: error.message || "Internal server error"
        });

    }

};

export const removeTeamMember = async (
    req,
    res
) => {

    try {

        const { teamId, userId } =
            req.params;

        const removedMember =
            await removeTeamMemberService(
                teamId,
                userId,
                req.user.id
            );

        return res.status(200).json({

            success: true,

            message: "Member removed successfully",

            data: {
                member: removedMember
            }

        });

    } catch (error) {

        console.error(
            "removeMember error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
};

// ======================================================
// MAKE MEMBER ADMIN
// ======================================================

export const makeMemberAdmin = async (req, res) => {

    try {

        const { teamId } = req.params;

        const { userId } = req.body;

        const requesterId =
            req.user.id;


        if (!userId) {

            return res.status(400).json({
                message: "User ID is required"
            });

        }


        const result =
            await makeMemberAdminService(
                Number(teamId),
                Number(userId),
                Number(requesterId)
            );


        return res.status(200).json({

            message: "Member promoted to Admin",

            member: result

        });

    } catch (err) {

        console.error(
            "MAKE ADMIN ERROR:",
            err
        );

        return res.status(
            err.statusCode || 500
        ).json({

            message:
                err.message ||
                "Failed to make member Admin"

        });

    }
};


// ======================================================
// REMOVE ADMIN ROLE
// ======================================================

export const removeAdminRole = async (req, res) => {

    try {

        const { teamId } = req.params;

        const { userId } = req.body;

        const requesterId =
            req.user.id;


        if (!userId) {

            return res.status(400).json({
                message: "User ID is required"
            });

        }


        const result =
            await removeAdminRoleService(
                Number(teamId),
                Number(userId),
                Number(requesterId)
            );


        return res.status(200).json({

            message: "Admin role removed",

            member: result

        });

    } catch (err) {

        console.error(
            "REMOVE ADMIN ERROR:",
            err
        );

        return res.status(
            err.statusCode || 500
        ).json({

            message:
                err.message ||
                "Failed to remove Admin role"

        });

    }
};

// ======================================================
// CREATE TEAM INVITE
//
// Owner OR Admin can generate an invite.
// Existing active invite is reused.
// ======================================================

// ======================================================
// CREATE TEAM INVITATION
//
// Owner OR Admin can create invitation.
// ======================================================

export const createTeamInvitation = async (
    req,
    res
) => {

    try {

        const { teamId } = req.params;

        const {
            expiresInDays
        } = req.body;


        const result =
            await createTeamInvitationService(
                Number(teamId),
                Number(req.user.id),
                expiresInDays ?? 7
            );


        return res.status(201).json({

            success: true,

            message:
                "Team invitation created successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "CREATE TEAM INVITATION ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to create team invitation"

        });

    }

};


// ======================================================
// GET TEAM INVITATIONS
//
// Owner OR Admin only.
// ======================================================

export const getTeamInvitations = async (
    req,
    res
) => {

    try {

        const { teamId } = req.params;


        const invitations =
            await getTeamInvitationsService(
                Number(teamId),
                Number(req.user.id)
            );


        return res.status(200).json({

            success: true,

            data: {
                invitations
            }

        });

    } catch (error) {

        console.error(
            "GET TEAM INVITATIONS ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to get team invitations"

        });

    }

};


// ======================================================
// GET INVITATION BY TOKEN
//
// PUBLIC
// No authentication required.
// ======================================================

export const getTeamInvitationByToken = async (
    req,
    res
) => {

    try {

        const { token } = req.params;


        if (!token) {

            return res.status(400).json({

                success: false,

                message:
                    "Invitation token is required"

            });

        }


        const invitation =
            await getTeamInvitationByTokenService(
                token
            );


        return res.status(200).json({

            success: true,

            data: {
                invitation
            }

        });

    } catch (error) {

        console.error(
            "GET TEAM INVITATION ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to validate invitation"

        });

    }

};


// ======================================================
// DEACTIVATE TEAM INVITATION
//
// Owner OR Admin only.
// ======================================================

export const deactivateTeamInvitation = async (
    req,
    res
) => {

    try {

        const {
            teamId,
            invitationId
        } = req.params;


        const invitation =
            await deactivateTeamInvitationService(
                Number(teamId),
                Number(invitationId),
                Number(req.user.id)
            );


        return res.status(200).json({

            success: true,

            message:
                "Team invitation deactivated successfully",

            data: {
                invitation
            }

        });

    } catch (error) {

        console.error(
            "DEACTIVATE TEAM INVITATION ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to deactivate invitation"

        });

    }

};


// ======================================================
// SUBMIT TEAM JOIN REQUEST
//
// Authenticated user only.
//
// IMPORTANT:
// User is NOT added to team_members here.
// Request becomes Pending.
// ======================================================

export const createTeamJoinRequest = async (
    req,
    res
) => {

    try {

        const { token } = req.params;


        if (!token) {

            return res.status(400).json({

                success: false,

                message:
                    "Invitation token is required"

            });

        }


        const result =
            await createTeamJoinRequestService(
                token,
                Number(req.user.id)
            );


        return res.status(201).json({

            success: true,

            message:
                "Join request submitted successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "CREATE TEAM JOIN REQUEST ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to submit join request"

        });

    }

};


// ======================================================
// GET TEAM JOIN REQUESTS
//
// Owner OR Admin only.
//
// Optional:
// ?status=Pending
// ?status=Approved
// ?status=Rejected
// ======================================================

export const getTeamJoinRequests = async (
    req,
    res
) => {

    try {

        const { teamId } = req.params;

        const { status } = req.query;


        const requests =
            await getTeamJoinRequestsService(
                Number(teamId),
                Number(req.user.id),
                status
            );


        return res.status(200).json({

            success: true,

            data: {
                requests
            }

        });

    } catch (error) {

        console.error(
            "GET TEAM JOIN REQUESTS ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to get join requests"

        });

    }

};


// ======================================================
// APPROVE TEAM JOIN REQUEST
//
// Owner OR Admin only.
//
// User becomes Member.
// Request becomes Approved.
// ======================================================

export const approveTeamJoinRequest = async (
    req,
    res
) => {

    try {

        const {
            teamId,
            requestId
        } = req.params;


        const result =
            await approveTeamJoinRequestService(
                Number(teamId),
                Number(requestId),
                Number(req.user.id)
            );


        return res.status(200).json({

            success: true,

            message:
                "Join request approved successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "APPROVE TEAM JOIN REQUEST ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to approve join request"

        });

    }

};


// ======================================================
// REJECT TEAM JOIN REQUEST
//
// Owner OR Admin only.
// ======================================================

export const rejectTeamJoinRequest = async (
    req,
    res
) => {

    try {

        const {
            teamId,
            requestId
        } = req.params;


        const result =
            await rejectTeamJoinRequestService(
                Number(teamId),
                Number(requestId),
                Number(req.user.id)
            );


        return res.status(200).json({

            success: true,

            message:
                "Join request rejected successfully",

            data: {
                request: result
            }

        });

    } catch (error) {

        console.error(
            "REJECT TEAM JOIN REQUEST ERROR:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Failed to reject join request"

        });

    }

};