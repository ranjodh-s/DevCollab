import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { getProjectById } from "../utils/project.js";
import { verifyTeamMember } from "../utils/authorization.js";


// =====================================================
// GET PROJECT MEMBERS
// =====================================================

export const getProjectMembersService = async (
    projectId,
    userId
) => {

    const project = await getProjectById(projectId);

    // User must belong to the workspace
    await verifyTeamMember(
        project.team_id,
        userId
    );

    const result = await pool.query(
        `SELECT
            pm.id,
            pm.project_id,
            pm.user_id,
            pm.role,
            pm.added_by,
            pm.created_at,
            u.name,
            u.email
         FROM project_members pm
         INNER JOIN users u
            ON pm.user_id = u.id
         WHERE pm.project_id = $1
         ORDER BY
            CASE pm.role
                WHEN 'Owner' THEN 1
                WHEN 'Manager' THEN 2
                WHEN 'Developer' THEN 3
                WHEN 'Contributor' THEN 4
                WHEN 'Viewer' THEN 5
                ELSE 6
            END,
            pm.created_at ASC`,
        [projectId]
    );

    return {
        project: {
            id: project.id,
            name: project.name,
            created_by: project.created_by
        },
        members: result.rows
    };
};


// =====================================================
// ADD PROJECT MEMBER
// =====================================================

export const addProjectMemberService = async (
    projectId,
    userId,
    addedBy
) => {

    const project = await getProjectById(projectId);

    // Person adding the member must belong to workspace
    await verifyTeamMember(
        project.team_id,
        addedBy
    );


    // Check current project member
    const currentMemberResult = await pool.query(
        `SELECT
            user_id,
            role
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            addedBy
        ]
    );


    if (currentMemberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    const currentMember =
        currentMemberResult.rows[0];


    // Only Owner / Manager can add members
    if (
        currentMember.role !== "Owner" &&
        currentMember.role !== "Manager"
    ) {

        throw new AppError(
            "You do not have permission to add project members",
            403
        );

    }


    // Check target user exists
    const userResult = await pool.query(
        `SELECT
            id,
            name,
            email
         FROM users
         WHERE id = $1`,
        [userId]
    );


    if (userResult.rows.length === 0) {

        throw new AppError(
            "User not found",
            404
        );

    }


    // Target user must already be in workspace
    const teamMemberResult = await pool.query(
        `SELECT
            user_id
         FROM team_members
         WHERE team_id = $1
         AND user_id = $2`,
        [
            project.team_id,
            userId
        ]
    );


    if (teamMemberResult.rows.length === 0) {

        throw new AppError(
            "User is not a member of this workspace",
            400
        );

    }


    // Check duplicate
    const existingMemberResult = await pool.query(
        `SELECT
            id
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            userId
        ]
    );


    if (existingMemberResult.rows.length > 0) {

        throw new AppError(
            "User is already a member of this project",
            409
        );

    }


    // Add as Contributor
    const result = await pool.query(
        `INSERT INTO project_members
        (
            project_id,
            user_id,
            role,
            added_by
        )
        VALUES($1,$2,$3,$4)
        RETURNING *`,
        [
            projectId,
            userId,
            "Contributor",
            addedBy
        ]
    );


    return {
        project: {
            id: project.id,
            name: project.name
        },
        member: result.rows[0],
        user: userResult.rows[0]
    };
};


// =====================================================
// UPDATE PROJECT MEMBER ROLE
// =====================================================

export const updateProjectMemberRoleService = async (
    projectId,
    userId,
    role,
    requesterId
) => {

    const validRoles = [
        "Owner",
        "Manager",
        "Developer",
        "Contributor",
        "Viewer"
    ];


    if (!validRoles.includes(role)) {

        throw new AppError(
            "Invalid project member role",
            400
        );

    }


    const project = await getProjectById(projectId);


    // Only project owner can change roles
    const ownerResult = await pool.query(
        `SELECT
            user_id,
            role
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            requesterId
        ]
    );


    if (ownerResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    if (ownerResult.rows[0].role !== "Owner") {

        throw new AppError(
            "Only the project owner can change member roles",
            403
        );

    }


    // Owner cannot change their own role
    if (
        String(userId) ===
        String(project.created_by)
    ) {

        throw new AppError(
            "Project owner role cannot be changed",
            400
        );

    }


    // Check target member
    const memberResult = await pool.query(
        `SELECT *
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "Project member not found",
            404
        );

    }


    const result = await pool.query(
        `UPDATE project_members
         SET role = $1
         WHERE project_id = $2
         AND user_id = $3
         RETURNING *`,
        [
            role,
            projectId,
            userId
        ]
    );


    return result.rows[0];
};


// =====================================================
// LEAVE PROJECT
// =====================================================

export const leaveProjectService = async (
    projectId,
    userId
) => {

    const project = await getProjectById(projectId);


    // Owner cannot leave
    if (
        String(project.created_by) ===
        String(userId)
    ) {

        throw new AppError(
            "Project owner cannot leave the project",
            400
        );

    }


    const result = await pool.query(
        `DELETE FROM project_members
         WHERE project_id = $1
         AND user_id = $2
         RETURNING *`,
        [
            projectId,
            userId
        ]
    );


    if (result.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            404
        );

    }


    return result.rows[0];
};


// =====================================================
// REMOVE PROJECT MEMBER
// =====================================================

export const removeProjectMemberService = async (
    projectId,
    userId,
    requesterId
) => {

    const project = await getProjectById(projectId);


    // Requester must be project member
    const requesterResult = await pool.query(
        `SELECT
            role
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            requesterId
        ]
    );


    if (requesterResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    const requesterRole =
        requesterResult.rows[0].role;


    // Only Owner / Manager can remove
    if (
        requesterRole !== "Owner" &&
        requesterRole !== "Manager"
    ) {

        throw new AppError(
            "You do not have permission to remove project members",
            403
        );

    }


    // Owner cannot be removed
    if (
        String(userId) ===
        String(project.created_by)
    ) {

        throw new AppError(
            "Project owner cannot be removed",
            400
        );

    }


    // Check target member
    const targetResult = await pool.query(
        `SELECT *
         FROM project_members
         WHERE project_id = $1
         AND user_id = $2`,
        [
            projectId,
            userId
        ]
    );


    if (targetResult.rows.length === 0) {

        throw new AppError(
            "Project member not found",
            404
        );

    }


    const targetRole =
        targetResult.rows[0].role;


    // Manager cannot remove another Manager
    if (
        requesterRole === "Manager" &&
        targetRole === "Manager"
    ) {

        throw new AppError(
            "Managers cannot remove another manager",
            403
        );

    }


    const result = await pool.query(
        `DELETE FROM project_members
         WHERE project_id = $1
         AND user_id = $2
         RETURNING *`,
        [
            projectId,
            userId
        ]
    );


    return result.rows[0];
};