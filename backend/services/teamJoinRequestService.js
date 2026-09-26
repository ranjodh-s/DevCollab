import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { getInvitationByToken } from "./teamInvitationService.js";


export const requestToJoinTeam = async (token, userId) => {

    // 1. Validate invitation
    const invitation = await getInvitationByToken(token);

    const teamId = invitation.team_id;


    // 2. Check if user is already a team member
    const memberResult = await pool.query(
        `
        SELECT
            tm.team_id,
            tm.user_id,
            tm.role
        FROM team_members tm
        WHERE tm.team_id = $1
        AND tm.user_id = $2
        `,
        [teamId, userId]
    );


    if (memberResult.rows.length > 0) {
        throw new AppError(
            "You are already a member of this team",
            400
        );
    }


    // 3. Check existing join request
    const requestResult = await pool.query(
        `
        SELECT
            id,
            team_id,
            user_id,
            invitation_id,
            status,
            created_at
        FROM team_join_requests
        WHERE team_id = $1
        AND user_id = $2
        `,
        [teamId, userId]
    );


    // 4. Existing request
    if (requestResult.rows.length > 0) {

        const existingRequest = requestResult.rows[0];


        // Already waiting for admin
        if (existingRequest.status === "Pending") {
            throw new AppError(
                "Your request to join this team is already pending",
                400
            );
        }


        // Previously approved but somehow user is not a member
        if (existingRequest.status === "Approved") {
            throw new AppError(
                "Your request has already been approved",
                400
            );
        }


        // Previously rejected
        if (existingRequest.status === "Rejected") {

            const result = await pool.query(
                `
                UPDATE team_join_requests
                SET
                    invitation_id = $1,
                    status = 'Pending',
                    reviewed_by = NULL,
                    reviewed_at = NULL,
                    created_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING
                    id,
                    team_id,
                    user_id,
                    invitation_id,
                    status,
                    created_at
                `,
                [
                    invitation.id,
                    existingRequest.id
                ]
            );

            return {
                request: result.rows[0],
                team: {
                    id: invitation.team_id,
                    name: invitation.team_name
                }
            };
        }
    }


    // 5. Create new request
    const result = await pool.query(
        `
        INSERT INTO team_join_requests (
            team_id,
            user_id,
            invitation_id,
            status
        )
        VALUES ($1, $2, $3, 'Pending')
        RETURNING
            id,
            team_id,
            user_id,
            invitation_id,
            status,
            created_at
        `,
        [
            teamId,
            userId,
            invitation.id
        ]
    );


    return {
        request: result.rows[0],
        team: {
            id: invitation.team_id,
            name: invitation.team_name
        }
    };
};

const checkTeamAdminAccess = async (teamId, userId) => {

    const result = await pool.query(
        `
        SELECT
            t.id,
            t.name,
            tm.role
        FROM teams t
        INNER JOIN team_members tm
            ON tm.team_id = t.id
        WHERE t.id = $1
        AND tm.user_id = $2
        `,
        [teamId, userId]
    );


    if (result.rows.length === 0) {
        throw new AppError(
            "Team not found or you are not a member of this team",
            404
        );
    }


    const team = result.rows[0];


    if (team.role !== "Owner" && team.role !== "Admin") {
        throw new AppError(
            "You do not have permission to manage join requests",
            403
        );
    }


    return team;
};

export const getTeamJoinRequests = async (
    teamId,
    userId,
    status = "Pending"
) => {

    await checkTeamAdminAccess(teamId, userId);


    const validStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];


    if (!validStatuses.includes(status)) {
        throw new AppError(
            "Invalid request status",
            400
        );
    }


    const result = await pool.query(
        `
        SELECT
            tjr.id,
            tjr.team_id,
            tjr.user_id,
            tjr.invitation_id,
            tjr.status,
            tjr.reviewed_by,
            tjr.reviewed_at,
            tjr.created_at,

            u.name AS user_name,
            u.email AS user_email,

            reviewer.name AS reviewer_name

        FROM team_join_requests tjr

        INNER JOIN users u
            ON u.id = tjr.user_id

        LEFT JOIN users reviewer
            ON reviewer.id = tjr.reviewed_by

        WHERE tjr.team_id = $1
        AND tjr.status = $2

        ORDER BY tjr.created_at DESC
        `,
        [teamId, status]
    );


    return result.rows;
};

export const approveJoinRequest = async (
    teamId,
    requestId,
    adminUserId
) => {

    const client = await pool.connect();


    try {

        await client.query("BEGIN");


        // 1. Verify admin
        const adminResult = await client.query(
            `
            SELECT role
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [teamId, adminUserId]
        );


        if (adminResult.rows.length === 0) {
            throw new AppError(
                "You are not a member of this team",
                403
            );
        }


        const adminRole = adminResult.rows[0].role;


        if (
            adminRole !== "Owner" &&
            adminRole !== "Admin"
        ) {
            throw new AppError(
                "You do not have permission to approve join requests",
                403
            );
        }


        // 2. Find pending request
        const requestResult = await client.query(
            `
            SELECT
                id,
                team_id,
                user_id,
                status
            FROM team_join_requests
            WHERE id = $1
            AND team_id = $2
            FOR UPDATE
            `,
            [requestId, teamId]
        );


        if (requestResult.rows.length === 0) {
            throw new AppError(
                "Join request not found",
                404
            );
        }


        const request = requestResult.rows[0];


        // 3. Make sure request is pending
        if (request.status !== "Pending") {
            throw new AppError(
                `Join request has already been ${request.status.toLowerCase()}`,
                400
            );
        }


        // 4. Check whether user is already a member
        const memberResult = await client.query(
            `
            SELECT 1
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [
                teamId,
                request.user_id
            ]
        );


        if (memberResult.rows.length > 0) {

            throw new AppError(
                "User is already a member of this team",
                400
            );

        }


        // 5. Add user to team
        await client.query(
            `
            INSERT INTO team_members (
                team_id,
                user_id,
                role
            )
            VALUES ($1, $2, 'Member')
            `,
            [
                teamId,
                request.user_id
            ]
        );


        // 6. Mark request as approved
        const updatedRequest = await client.query(
            `
            UPDATE team_join_requests
            SET
                status = 'Approved',
                reviewed_by = $1,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING
                id,
                team_id,
                user_id,
                invitation_id,
                status,
                reviewed_by,
                reviewed_at,
                created_at
            `,
            [
                adminUserId,
                requestId
            ]
        );


        await client.query("COMMIT");


        return updatedRequest.rows[0];


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};

export const rejectJoinRequest = async (
    teamId,
    requestId,
    adminUserId
) => {

    await checkTeamAdminAccess(
        teamId,
        adminUserId
    );


    const result = await pool.query(
        `
        UPDATE team_join_requests
        SET
            status = 'Rejected',
            reviewed_by = $1,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE id = $2
        AND team_id = $3
        AND status = 'Pending'

        RETURNING
            id,
            team_id,
            user_id,
            invitation_id,
            status,
            reviewed_by,
            reviewed_at,
            created_at
        `,
        [
            adminUserId,
            requestId,
            teamId
        ]
    );


    if (result.rows.length === 0) {

        const requestExists = await pool.query(
            `
            SELECT
                id,
                status
            FROM team_join_requests
            WHERE id = $1
            AND team_id = $2
            `,
            [
                requestId,
                teamId
            ]
        );


        if (requestExists.rows.length === 0) {
            throw new AppError(
                "Join request not found",
                404
            );
        }


        throw new AppError(
            `Join request has already been ${requestExists.rows[0].status.toLowerCase()}`,
            400
        );
    }


    return result.rows[0];
};