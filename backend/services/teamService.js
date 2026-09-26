import pool from "../config/db.js";
import crypto from "crypto";
import { logTeamActivity } from "./activityService.js";


// ======================================================
// CREATE TEAM
// Creator automatically becomes OWNER
// ======================================================

export const createTeamService = async (
    name,
    description,
    userId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // --------------------------------
        // 1. Create team
        // --------------------------------

        const teamResult = await client.query(
            `
            INSERT INTO teams
                (name, description, created_by)
            VALUES
                ($1, $2, $3)
            RETURNING *
            `,
            [
                name,
                description,
                userId
            ]
        );

        const team = teamResult.rows[0];


        // --------------------------------
        // 2. Creator becomes OWNER
        // --------------------------------

        await client.query(
            `
            INSERT INTO team_members
                (team_id, user_id, role)
            VALUES
                ($1, $2, 'Owner')
            `,
            [
                team.id,
                userId
            ]
        );


        await client.query("COMMIT");


        // --------------------------------
        // 3. Log activity
        // --------------------------------

        await logTeamActivity(
            team.id,
            userId,
            "TEAM_CREATED",
            `Created workspace "${team.name}"`
        );


        return team;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};


// ======================================================
// ADD TEAM MEMBER
// Owner OR Admin can add members
// New members are regular Members
// ======================================================

export const addTeamMemberService = async (
    teamId,
    userId,
    requesterId
) => {

    // --------------------------------
    // 1. Check team exists
    // --------------------------------

    const teamResult = await pool.query(
        `
        SELECT
            id,
            name
        FROM teams
        WHERE id = $1
        `,
        [teamId]
    );

    if (teamResult.rows.length === 0) {

        const error = new Error(
            "Team not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // --------------------------------
    // 2. Check requester role
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );

    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 3. Owner/Admin can add
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to add members"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 4. Check target user
    // --------------------------------

    const userResult = await pool.query(
        `
        SELECT
            id,
            name,
            email
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    if (userResult.rows.length === 0) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // --------------------------------
    // 5. Check existing membership
    // --------------------------------

    const existingMember =
        await pool.query(
            `
            SELECT
                team_id,
                user_id,
                role
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [
                teamId,
                userId
            ]
        );


    if (existingMember.rows.length > 0) {

        const error = new Error(
            "User is already a member of this team"
        );

        error.statusCode = 409;

        throw error;
    }


    // --------------------------------
    // 6. Add as Member
    // --------------------------------

    const memberResult = await pool.query(
        `
        INSERT INTO team_members
            (team_id, user_id, role)
        VALUES
            ($1, $2, 'Member')
        RETURNING
            team_id,
            user_id,
            role
        `,
        [
            teamId,
            userId
        ]
    );


    // --------------------------------
    // 7. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "MEMBER_ADDED",
        `Added ${userResult.rows[0].name} to the workspace`
    );


    return {

        team: teamResult.rows[0],

        member: memberResult.rows[0],

        user: userResult.rows[0]

    };
};


// ======================================================
// REMOVE TEAM MEMBER
//
// Owner:
//   - Can remove Member
//   - Can remove Admin
//   - Cannot remove Owner
//
// Admin:
//   - Can remove Member
//   - Cannot remove Admin
//   - Cannot remove Owner
// ======================================================

export const removeTeamMemberService = async (
    teamId,
    userId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 2. Owner/Admin can remove
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to remove members"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Find target member
    // --------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            team_id,
            user_id,
            role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        const error = new Error(
            "User is not a member of this team"
        );

        error.statusCode = 404;

        throw error;
    }


    const member =
        memberResult.rows[0];


    // --------------------------------
    // 4. Owner cannot be removed
    // --------------------------------

    if (member.role === "Owner") {

        const error = new Error(
            "Team owner cannot be removed"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 5. Admin cannot remove Admin
    // --------------------------------

    if (
        requesterRole === "Admin" &&
        member.role === "Admin"
    ) {

        const error = new Error(
            "Admins cannot remove other admins"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 6. Remove member
    // --------------------------------

    await pool.query(
        `
        DELETE FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            userId
        ]
    );


    // --------------------------------
    // 7. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "MEMBER_REMOVED",
        `Removed user #${userId} from the workspace`
    );


    return member;
};


// ======================================================
// MAKE MEMBER ADMIN
// ONLY OWNER CAN DO THIS
// ======================================================

export const makeMemberAdminService = async (
    teamId,
    userId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 2. ONLY OWNER
    // --------------------------------

    if (
        requesterResult.rows[0].role !== "Owner"
    ) {

        const error = new Error(
            "Only the team owner can make admins"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Find target member
    // --------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            team_id,
            user_id,
            role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        const error = new Error(
            "User is not a member of this team"
        );

        error.statusCode = 404;

        throw error;
    }


    const member =
        memberResult.rows[0];


    // --------------------------------
    // 4. Owner cannot become Admin
    // --------------------------------

    if (member.role === "Owner") {

        const error = new Error(
            "Owner cannot be changed to Admin"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 5. Already Admin
    // --------------------------------

    if (member.role === "Admin") {

        const error = new Error(
            "User is already an Admin"
        );

        error.statusCode = 409;

        throw error;
    }


    // --------------------------------
    // 6. Make Admin
    // --------------------------------

    const result = await pool.query(
        `
        UPDATE team_members
        SET role = 'Admin'
        WHERE team_id = $1
        AND user_id = $2
        RETURNING
            team_id,
            user_id,
            role
        `,
        [
            teamId,
            userId
        ]
    );


    // --------------------------------
    // 7. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "ADMIN_ASSIGNED",
        `Made user #${userId} an Admin`
    );


    return result.rows[0];
};


// ======================================================
// REMOVE ADMIN ROLE
// ONLY OWNER CAN DO THIS
// ======================================================

export const removeAdminRoleService = async (
    teamId,
    userId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 2. ONLY OWNER
    // --------------------------------

    if (
        requesterResult.rows[0].role !== "Owner"
    ) {

        const error = new Error(
            "Only the team owner can remove admin roles"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Find target member
    // --------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            team_id,
            user_id,
            role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        const error = new Error(
            "User is not a member of this team"
        );

        error.statusCode = 404;

        throw error;
    }


    const member =
        memberResult.rows[0];


    // --------------------------------
    // 4. Owner cannot lose Owner role
    // --------------------------------

    if (member.role === "Owner") {

        const error = new Error(
            "Owner role cannot be removed"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 5. Target must be Admin
    // --------------------------------

    if (member.role !== "Admin") {

        const error = new Error(
            "User is not an Admin"
        );

        error.statusCode = 409;

        throw error;
    }


    // --------------------------------
    // 6. Admin -> Member
    // --------------------------------

    const result = await pool.query(
        `
        UPDATE team_members
        SET role = 'Member'
        WHERE team_id = $1
        AND user_id = $2
        RETURNING
            team_id,
            user_id,
            role
        `,
        [
            teamId,
            userId
        ]
    );


    // --------------------------------
    // 7. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "ADMIN_ROLE_REMOVED",
        `Removed Admin role from user #${userId}`
    );


    return result.rows[0];
};


// ======================================================
// CREATE TEAM INVITATION
//
// Owner OR Admin can generate an invitation.
// Existing active, non-expired invitation is reused.
// expiresInDays: 1-30
// ======================================================

export const createTeamInvitationService = async (
    teamId,
    requesterId,
    expiresInDays = 7
) => {

    // --------------------------------
    // 1. Validate expiration
    // --------------------------------

    const days = Number(expiresInDays);

    if (
        !Number.isInteger(days) ||
        days < 1 ||
        days > 30
    ) {
        const error = new Error(
            "expiresInDays must be an integer between 1 and 30"
        );

        error.statusCode = 400;

        throw error;
    }


    // --------------------------------
    // 2. Check requester role
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 3. Owner/Admin only
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to create an invitation"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 4. Check team exists
    // --------------------------------

    const teamResult = await pool.query(
        `
        SELECT
            id,
            name,
            description
        FROM teams
        WHERE id = $1
        `,
        [teamId]
    );


    if (teamResult.rows.length === 0) {

        const error = new Error(
            "Team not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // --------------------------------
    // 5. Reuse existing active invite
    // --------------------------------

    const existingInviteResult =
        await pool.query(
            `
            SELECT
                id,
                team_id,
                token,
                created_by,
                expires_at,
                is_active,
                created_at
            FROM team_invitations
            WHERE team_id = $1
            AND is_active = true
            AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [teamId]
        );


    if (existingInviteResult.rows.length > 0) {

        return {
            invitation: existingInviteResult.rows[0],
            team: teamResult.rows[0]
        };

    }


    // --------------------------------
    // 6. Generate secure token
    // --------------------------------

    const token =
        crypto.randomBytes(32).toString("hex");


    // --------------------------------
    // 7. Create invitation
    // --------------------------------

    const invitationResult =
        await pool.query(
            `
            INSERT INTO team_invitations
                (
                    team_id,
                    token,
                    created_by,
                    expires_at
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_TIMESTAMP + ($4 * INTERVAL '1 day')
                )
            RETURNING
                id,
                team_id,
                token,
                created_by,
                expires_at,
                is_active,
                created_at
            `,
            [
                teamId,
                token,
                requesterId,
                days
            ]
        );


    // --------------------------------
    // 8. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "INVITATION_CREATED",
        "Created a workspace invitation"
    );


    return {
        invitation: invitationResult.rows[0],
        team: teamResult.rows[0]
    };

};


// ======================================================
// GET TEAM INVITATIONS
//
// Owner OR Admin only.
// ======================================================

export const getTeamInvitationsService = async (
    teamId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester role
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 2. Owner/Admin only
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to view invitations"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Get invitations
    // --------------------------------

    const result = await pool.query(
        `
        SELECT
            ti.id,
            ti.team_id,
            ti.token,
            ti.created_by,
            ti.expires_at,
            ti.is_active,
            ti.created_at,

            u.name AS created_by_name,
            u.email AS created_by_email

        FROM team_invitations ti

        JOIN users u
            ON u.id = ti.created_by

        WHERE ti.team_id = $1

        ORDER BY ti.created_at DESC
        `,
        [teamId]
    );


    return result.rows;

};


// ======================================================
// GET INVITATION BY TOKEN
//
// Public endpoint.
// Only active + non-expired invitations are valid.
// ======================================================

export const getTeamInvitationByTokenService = async (
    token
) => {

    const result = await pool.query(
        `
        SELECT
            ti.id AS invitation_id,
            ti.team_id,
            ti.token,
            ti.created_by,
            ti.expires_at,
            ti.is_active,
            ti.created_at,

            t.name AS team_name,
            t.description AS team_description

        FROM team_invitations ti

        JOIN teams t
            ON t.id = ti.team_id

        WHERE ti.token = $1
        AND ti.is_active = true
        AND ti.expires_at > CURRENT_TIMESTAMP
        `,
        [token]
    );


    if (result.rows.length === 0) {

        const error = new Error(
            "Invalid or expired invitation link"
        );

        error.statusCode = 404;

        throw error;
    }


    return result.rows[0];

};


// ======================================================
// DEACTIVATE TEAM INVITATION
//
// Owner OR Admin can deactivate an invitation.
// ======================================================

export const deactivateTeamInvitationService = async (
    teamId,
    invitationId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester role
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 2. Owner/Admin only
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to deactivate invitations"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Deactivate invitation
    // --------------------------------

    const result = await pool.query(
        `
        UPDATE team_invitations
        SET is_active = false
        WHERE id = $1
        AND team_id = $2
        AND is_active = true
        RETURNING
            id,
            team_id,
            token,
            created_by,
            expires_at,
            is_active,
            created_at
        `,
        [
            invitationId,
            teamId
        ]
    );


    if (result.rows.length === 0) {

        const error = new Error(
            "Active invitation not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // --------------------------------
    // 4. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "INVITATION_DEACTIVATED",
        "Deactivated a workspace invitation"
    );


    return result.rows[0];

};


// ======================================================
// CREATE TEAM JOIN REQUEST
//
// Authenticated user opens invitation and requests
// to join the team.
//
// User is NOT added to team_members here.
// Admin/Owner must approve the request.
// ======================================================

export const createTeamJoinRequestService = async (
    token,
    userId
) => {

    // --------------------------------
    // 1. Find valid invitation
    // --------------------------------

    const invitationResult =
        await pool.query(
            `
            SELECT
                ti.id AS invitation_id,
                ti.team_id,

                t.name AS team_name,
                t.description AS team_description

            FROM team_invitations ti

            JOIN teams t
                ON t.id = ti.team_id

            WHERE ti.token = $1
            AND ti.is_active = true
            AND ti.expires_at > CURRENT_TIMESTAMP
            `,
            [token]
        );


    if (invitationResult.rows.length === 0) {

        const error = new Error(
            "Invalid or expired invitation link"
        );

        error.statusCode = 404;

        throw error;
    }


    const invitation =
        invitationResult.rows[0];


    // --------------------------------
    // 2. Check existing membership
    // --------------------------------

    const existingMemberResult =
        await pool.query(
            `
            SELECT
                team_id,
                user_id,
                role
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [
                invitation.team_id,
                userId
            ]
        );


    if (existingMemberResult.rows.length > 0) {

        const error = new Error(
            "You are already a member of this team"
        );

        error.statusCode = 409;

        throw error;
    }


    // --------------------------------
    // 3. Check existing join request
    // --------------------------------

    const existingRequestResult =
        await pool.query(
            `
            SELECT
                id,
                team_id,
                user_id,
                invitation_id,
                status,
                created_at,
                reviewed_at,
                reviewed_by
            FROM team_join_requests
            WHERE team_id = $1
            AND user_id = $2
            `,
            [
                invitation.team_id,
                userId
            ]
        );


    if (existingRequestResult.rows.length > 0) {

        const existingRequest =
            existingRequestResult.rows[0];


        // Pending request cannot be duplicated

        if (existingRequest.status === "Pending") {

            const error = new Error(
                "You already have a pending join request"
            );

            error.statusCode = 409;

            throw error;
        }


        // Approved request should normally mean
        // the user is already a member.

        if (existingRequest.status === "Approved") {

            const error = new Error(
                "Your join request has already been approved"
            );

            error.statusCode = 409;

            throw error;
        }


        // Rejected request can be submitted again.

        if (existingRequest.status === "Rejected") {

            const result = await pool.query(
                `
                UPDATE team_join_requests
                SET
                    invitation_id = $1,
                    status = 'Pending',
                    created_at = CURRENT_TIMESTAMP,
                    reviewed_at = NULL,
                    reviewed_by = NULL
                WHERE id = $2
                RETURNING
                    id,
                    team_id,
                    user_id,
                    invitation_id,
                    status,
                    created_at,
                    reviewed_at,
                    reviewed_by
                `,
                [
                    invitation.invitation_id,
                    existingRequest.id
                ]
            );


            // --------------------------------
            // Log re-submitted request
            // --------------------------------

            await logTeamActivity(
                invitation.team_id,
                userId,
                "JOIN_REQUEST_CREATED",
                `Requested to join workspace "${invitation.team_name}"`
            );


            return {
                team: {
                    id: invitation.team_id,
                    name: invitation.team_name,
                    description: invitation.team_description
                },
                request: result.rows[0]
            };

        }

    }


    // --------------------------------
    // 4. Create new request
    // --------------------------------

    const requestResult =
        await pool.query(
            `
            INSERT INTO team_join_requests
                (
                    team_id,
                    user_id,
                    invitation_id,
                    status
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    'Pending'
                )
            RETURNING
                id,
                team_id,
                user_id,
                invitation_id,
                status,
                created_at,
                reviewed_at,
                reviewed_by
            `,
            [
                invitation.team_id,
                userId,
                invitation.invitation_id
            ]
        );


    // --------------------------------
    // 5. Log activity
    // --------------------------------

    await logTeamActivity(
        invitation.team_id,
        userId,
        "JOIN_REQUEST_CREATED",
        `Requested to join workspace "${invitation.team_name}"`
    );


    return {
        team: {
            id: invitation.team_id,
            name: invitation.team_name,
            description: invitation.team_description
        },
        request: requestResult.rows[0]
    };

};


// ======================================================
// GET TEAM JOIN REQUESTS
//
// Owner OR Admin only.
//
// Optional status:
// Pending
// Approved
// Rejected
// ======================================================

export const getTeamJoinRequestsService = async (
    teamId,
    requesterId,
    status
) => {

    // --------------------------------
    // 1. Check requester role
    // --------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 2. Owner/Admin only
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to view join requests"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Validate optional status
    // --------------------------------

    if (
        status &&
        ![
            "Pending",
            "Approved",
            "Rejected"
        ].includes(status)
    ) {

        const error = new Error(
            "Invalid request status"
        );

        error.statusCode = 400;

        throw error;
    }


    // --------------------------------
    // 4. Build query
    // --------------------------------

    let query = `
        SELECT
            jr.id,
            jr.team_id,
            jr.user_id,
            jr.invitation_id,
            jr.status,
            jr.created_at,
            jr.reviewed_at,
            jr.reviewed_by,

            u.name AS user_name,
            u.email AS user_email,

            reviewer.name AS reviewed_by_name

        FROM team_join_requests jr

        JOIN users u
            ON u.id = jr.user_id

        LEFT JOIN users reviewer
            ON reviewer.id = jr.reviewed_by

        WHERE jr.team_id = $1
    `;


    const values = [teamId];


    if (status) {

        query += `
            AND jr.status = $2
        `;

        values.push(status);
    }


    query += `
        ORDER BY jr.created_at DESC
    `;


    const result = await pool.query(
        query,
        values
    );


    return result.rows;

};


// ======================================================
// APPROVE TEAM JOIN REQUEST
//
// Owner OR Admin can approve.
//
// Approval:
// 1. Locks request
// 2. Checks request is Pending
// 3. Adds user as Member
// 4. Marks request Approved
//
// All done inside one transaction.
// ======================================================

export const approveTeamJoinRequestService = async (
    teamId,
    requestId,
    requesterId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // --------------------------------
        // 1. Check requester role
        // --------------------------------

        const requesterResult =
            await client.query(
                `
                SELECT role
                FROM team_members
                WHERE team_id = $1
                AND user_id = $2
                `,
                [
                    teamId,
                    requesterId
                ]
            );


        if (requesterResult.rows.length === 0) {

            const error = new Error(
                "You are not a member of this team"
            );

            error.statusCode = 403;

            throw error;
        }


        const requesterRole =
            requesterResult.rows[0].role;


        if (
            requesterRole !== "Owner" &&
            requesterRole !== "Admin"
        ) {

            const error = new Error(
                "You do not have permission to approve join requests"
            );

            error.statusCode = 403;

            throw error;
        }


        // --------------------------------
        // 2. Lock pending request
        // --------------------------------

        const requestResult =
            await client.query(
                `
                SELECT
                    id,
                    team_id,
                    user_id,
                    invitation_id,
                    status,
                    created_at,
                    reviewed_at,
                    reviewed_by
                FROM team_join_requests
                WHERE id = $1
                AND team_id = $2
                FOR UPDATE
                `,
                [
                    requestId,
                    teamId
                ]
            );


        if (requestResult.rows.length === 0) {

            const error = new Error(
                "Join request not found"
            );

            error.statusCode = 404;

            throw error;
        }


        const request =
            requestResult.rows[0];


        // --------------------------------
        // 3. Request must be Pending
        // --------------------------------

        if (request.status !== "Pending") {

            const error = new Error(
                `Join request is already ${request.status}`
            );

            error.statusCode = 409;

            throw error;
        }


        // --------------------------------
        // 4. Check membership
        // --------------------------------

        const existingMemberResult =
            await client.query(
                `
                SELECT
                    team_id,
                    user_id,
                    role
                FROM team_members
                WHERE team_id = $1
                AND user_id = $2
                FOR UPDATE
                `,
                [
                    teamId,
                    request.user_id
                ]
            );


        if (existingMemberResult.rows.length > 0) {

            const error = new Error(
                "User is already a member of this team"
            );

            error.statusCode = 409;

            throw error;
        }


        // --------------------------------
        // 5. Add user as Member
        // --------------------------------

        const memberResult =
            await client.query(
                `
                INSERT INTO team_members
                    (
                        team_id,
                        user_id,
                        role
                    )
                VALUES
                    (
                        $1,
                        $2,
                        'Member'
                    )
                RETURNING
                    team_id,
                    user_id,
                    role
                `,
                [
                    teamId,
                    request.user_id
                ]
            );


        // --------------------------------
        // 6. Mark request Approved
        // --------------------------------

        const approvedResult =
            await client.query(
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
                    created_at,
                    reviewed_at,
                    reviewed_by
                `,
                [
                    requesterId,
                    requestId
                ]
            );


        await client.query("COMMIT");


        // --------------------------------
        // 7. Log activity
        // --------------------------------

        await logTeamActivity(
            teamId,
            requesterId,
            "JOIN_REQUEST_APPROVED",
            `Approved join request for user #${request.user_id}`
        );


        return {
            request: approvedResult.rows[0],
            member: memberResult.rows[0]
        };


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};


// ======================================================
// REJECT TEAM JOIN REQUEST
//
// Owner OR Admin can reject.
// User can submit a new request later.
// ======================================================

export const rejectTeamJoinRequestService = async (
    teamId,
    requestId,
    requesterId
) => {

    // --------------------------------
    // 1. Check requester role
    // --------------------------------

    const requesterResult =
        await pool.query(
            `
            SELECT role
            FROM team_members
            WHERE team_id = $1
            AND user_id = $2
            `,
            [
                teamId,
                requesterId
            ]
        );


    if (requesterResult.rows.length === 0) {

        const error = new Error(
            "You are not a member of this team"
        );

        error.statusCode = 403;

        throw error;
    }


    const requesterRole =
        requesterResult.rows[0].role;


    // --------------------------------
    // 2. Owner/Admin only
    // --------------------------------

    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Admin"
    ) {

        const error = new Error(
            "You do not have permission to reject join requests"
        );

        error.statusCode = 403;

        throw error;
    }


    // --------------------------------
    // 3. Reject pending request
    // --------------------------------

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
            created_at,
            reviewed_at,
            reviewed_by
        `,
        [
            requesterId,
            requestId,
            teamId
        ]
    );


    if (result.rows.length === 0) {

        const error = new Error(
            "Pending join request not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // --------------------------------
    // 4. Log activity
    // --------------------------------

    await logTeamActivity(
        teamId,
        requesterId,
        "JOIN_REQUEST_REJECTED",
        `Rejected join request for user #${result.rows[0].user_id}`
    );


    return result.rows[0];

};