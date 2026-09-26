import crypto from "crypto";
import pool from "../config/db.js";
import AppError from "../utils/AppError.js";


// ==========================================
// CHECK TEAM ADMIN ACCESS
// ==========================================

const checkTeamAdminAccess = async (
    teamId,
    userId
) => {

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
        [
            teamId,
            userId
        ]
    );


    if (result.rows.length === 0) {

        throw new AppError(
            "Team not found or you are not a member of this team",
            404
        );

    }


    const team = result.rows[0];


    // Only Owner/Admin can create invitations
    if (
        team.role !== "Owner" &&
        team.role !== "Admin"
    ) {

        throw new AppError(
            "You do not have permission to manage team invitations",
            403
        );

    }


    return team;

};


// ==========================================
// CREATE INVITATION
// ==========================================

export const createInvitation = async (
    teamId,
    userId,
    expiresInDays = 7
) => {

    // Validate team/admin
    const team =
        await checkTeamAdminAccess(
            teamId,
            userId
        );


    // Validate expiration
    const days =
        Number(expiresInDays);


    if (
        !Number.isInteger(days) ||
        days < 1 ||
        days > 30
    ) {

        throw new AppError(
            "Expiration must be between 1 and 30 days",
            400
        );

    }


    // Generate secure random token
    const token =
        crypto.randomBytes(32).toString("hex");


    // Calculate expiration
    const expiresAt =
        new Date();


    expiresAt.setDate(
        expiresAt.getDate() + days
    );


    const result =
        await pool.query(
            `
            INSERT INTO team_invitations (
                team_id,
                token,
                created_by,
                expires_at
            )
            VALUES ($1, $2, $3, $4)
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
                userId,
                expiresAt
            ]
        );


    return {
        invitation: result.rows[0],
        team
    };

};


// ==========================================
// GET TEAM INVITATIONS
// ==========================================

export const getTeamInvitations = async (
    teamId,
    userId
) => {

    // Verify admin access
    await checkTeamAdminAccess(
        teamId,
        userId
    );


    const result =
        await pool.query(
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

            INNER JOIN users u
                ON u.id = ti.created_by

            WHERE ti.team_id = $1

            ORDER BY ti.created_at DESC
            `,
            [
                teamId
            ]
        );


    return result.rows;

};


// ==========================================
// DEACTIVATE INVITATION
// ==========================================

export const deactivateInvitation = async (
    teamId,
    invitationId,
    userId
) => {

    // Verify admin access
    await checkTeamAdminAccess(
        teamId,
        userId
    );


    const result =
        await pool.query(
            `
            UPDATE team_invitations

            SET is_active = FALSE

            WHERE id = $1
            AND team_id = $2

            RETURNING
                id,
                team_id,
                token,
                is_active,
                expires_at
            `,
            [
                invitationId,
                teamId
            ]
        );


    if (result.rows.length === 0) {

        throw new AppError(
            "Invitation not found",
            404
        );

    }


    return result.rows[0];

};


// ==========================================
// GET INVITATION BY TOKEN
// ==========================================

export const getInvitationByToken = async (
    token
) => {

    if (
        !token ||
        typeof token !== "string"
    ) {

        throw new AppError(
            "Invitation token is required",
            400
        );

    }


    const result =
        await pool.query(
            `
            SELECT
                ti.id,
                ti.team_id,
                ti.token,
                ti.expires_at,
                ti.is_active,
                ti.created_at,

                t.name AS team_name,
                t.description AS team_description,

                u.name AS created_by_name

            FROM team_invitations ti

            INNER JOIN teams t
                ON t.id = ti.team_id

            INNER JOIN users u
                ON u.id = ti.created_by

            WHERE ti.token = $1
            `,
            [
                token
            ]
        );


    if (result.rows.length === 0) {

        throw new AppError(
            "Invitation not found",
            404
        );

    }


    const invitation =
        result.rows[0];


    // Check active status
    if (!invitation.is_active) {

        throw new AppError(
            "This invitation is no longer active",
            400
        );

    }


    // Check expiration
    if (
        new Date(invitation.expires_at)
            <= new Date()
    ) {

        throw new AppError(
            "This invitation has expired",
            400
        );

    }


    return invitation;

};