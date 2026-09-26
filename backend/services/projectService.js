import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { verifyTeamMember } from "../utils/authorization.js";
import {
    logActivity,
    logTeamActivity
} from "./activityService.js";



// ======================================================
// CREATE PROJECT
// ======================================================

export const createProjectService = async (
    teamId,
    name,
    description,
    userId
) => {

    // Check if team exists
    const teamResult = await pool.query(
        "SELECT * FROM teams WHERE id = $1",
        [teamId]
    );

    if (teamResult.rows.length === 0) {

        throw new AppError(
            "Team not found",
            404
        );

    }


    // Check workspace membership
    await verifyTeamMember(
        teamId,
        userId
    );


    // Create project
    const result = await pool.query(
        `INSERT INTO projects
        (
            team_id,
            name,
            description,
            created_by
        )
        VALUES($1, $2, $3, $4)
        RETURNING *`,
        [
            teamId,
            name,
            description || null,
            userId
        ]
    );


    const project = result.rows[0];

    

    await pool.query(
    `
    INSERT INTO project_chats (
        project_id
    )
    VALUES ($1)
    `,
    [project.id]
);



    // --------------------------------------------------
    // Add project creator as Owner
    // --------------------------------------------------

    await pool.query(
        `INSERT INTO project_members
        (
            project_id,
            user_id,
            role,
            added_by
        )
        VALUES($1, $2, 'Owner', $2)`,
        [
            project.id,
            userId
        ]
    );

    


    // --------------------------------------------------
    // LOG PROJECT ACTIVITY
    // --------------------------------------------------

    await logActivity(
        project.id,
        null,
        userId,
        "PROJECT_CREATED",
        `Created project "${project.name}"`
    );


    // --------------------------------------------------
    // LOG TEAM ACTIVITY
    // --------------------------------------------------

    await logTeamActivity(
        project.team_id,
        userId,
        "PROJECT_CREATED",
        `Project "${project.name}" created`
    );


    return project;
};



// ======================================================
// GET PROJECTS BY TEAM
// ======================================================

export const getProjectsByTeamService = async (
    teamId,
    userId
) => {

    const memberResult = await pool.query(
        `SELECT *
         FROM team_members
         WHERE team_id = $1
         AND user_id = $2`,
        [
            teamId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }


    const result = await pool.query(
        `SELECT *
         FROM projects
         WHERE team_id = $1
         ORDER BY created_at DESC`,
        [teamId]
    );


    return result.rows;
};



// ======================================================
// UPDATE PROJECT
// OWNER / ADMIN ONLY
// ======================================================

export const updateProjectService = async (
    projectId,
    name,
    description,
    userId
) => {

    // --------------------------------
    // 1. Validate project name
    // --------------------------------

    if (!name || !name.trim()) {

        throw new AppError(
            "Project name is required",
            400
        );

    }


    // --------------------------------
    // 2. Find project
    // --------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            team_id,
            name,
            description,
            created_by
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------
    // 3. Check user's team role
    // --------------------------------

    const memberResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            project.team_id,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }


    const role =
        memberResult.rows[0].role;


    // --------------------------------
    // 4. Only Owner/Admin can edit
    // --------------------------------

    if (
        role !== "Owner" &&
        role !== "Admin"
    ) {

        throw new AppError(
            "You do not have permission to edit projects",
            403
        );

    }


    // --------------------------------
    // 5. Update project
    // --------------------------------

    const result = await pool.query(
        `
        UPDATE projects
        SET
            name = $1,
            description = $2
        WHERE id = $3
        RETURNING *
        `,
        [
            name.trim(),
            description?.trim() || null,
            projectId
        ]
    );


    // --------------------------------
    // 6. Check update result
    // --------------------------------

    if (result.rows.length === 0) {

        throw new AppError(
            "Project could not be updated",
            500
        );

    }


    const updatedProject =
        result.rows[0];


    // --------------------------------
    // 7. LOG PROJECT ACTIVITY
    // --------------------------------

    await logActivity(
        projectId,
        null,
        userId,
        "PROJECT_UPDATED",
        `Updated project "${updatedProject.name}"`
    );


    // --------------------------------
    // 8. LOG TEAM ACTIVITY
    // --------------------------------

    await logTeamActivity(
        updatedProject.team_id,
        userId,
        "PROJECT_UPDATED",
        `Project "${updatedProject.name}" updated`
    );


    return updatedProject;
};



// ======================================================
// DELETE PROJECT
// OWNER / ADMIN ONLY
// ======================================================

export const deleteProjectService = async (
    projectId,
    userId
) => {

    // --------------------------------
    // 1. Find project
    // --------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            team_id,
            name,
            description,
            created_by
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------
    // 2. Check user's team role
    // --------------------------------

    const memberResult = await pool.query(
        `
        SELECT role
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            project.team_id,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }


    const role =
        memberResult.rows[0].role;


    // --------------------------------
    // 3. Only Owner/Admin can delete
    // --------------------------------

    if (
        role !== "Owner" &&
        role !== "Admin"
    ) {

        throw new AppError(
            "You do not have permission to delete projects",
            403
        );

    }


    // --------------------------------
    // 4. LOG PROJECT ACTIVITY
    // --------------------------------

    await logActivity(
        projectId,
        null,
        userId,
        "PROJECT_DELETED",
        `Deleted project "${project.name}"`
    );


    // --------------------------------
    // 5. Delete project
    // --------------------------------

    const deleteResult = await pool.query(
        `
        DELETE FROM projects
        WHERE id = $1
        RETURNING *
        `,
        [projectId]
    );


    if (deleteResult.rows.length === 0) {

        throw new AppError(
            "Project could not be deleted",
            500
        );

    }


    // --------------------------------
    // 6. LOG TEAM ACTIVITY
    // --------------------------------

    await logTeamActivity(
        project.team_id,
        userId,
        "PROJECT_DELETED",
        `Project "${project.name}" deleted`
    );


    // --------------------------------
    // 7. Return deleted project
    // --------------------------------

    return deleteResult.rows[0];
};



// ======================================================
// ADD PROJECT MEMBER
// ======================================================

export const addProjectMemberService = async (
    projectId,
    userId,
    addedBy
) => {

    // --------------------------------------
    // 1. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by,
            team_id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------------
    // 2. Check requester is workspace member
    // --------------------------------------

    await verifyTeamMember(
        project.team_id,
        addedBy
    );


    // --------------------------------------
    // 3. Check requester project membership
    // --------------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            addedBy
        ]
    );


    const isProjectOwner =
        String(project.created_by) ===
        String(addedBy);


    const isProjectMember =
        requesterResult.rows.length > 0;


    if (
        !isProjectOwner &&
        !isProjectMember
    ) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 4. Check add permission
    // --------------------------------------

    if (!isProjectOwner) {

        const requesterRole =
            requesterResult.rows[0].role;


        if (
            requesterRole !== "Owner" &&
            requesterRole !== "Manager"
        ) {

            throw new AppError(
                "You do not have permission to add project members",
                403
            );

        }

    }


    // --------------------------------------
    // 5. Check target user exists
    // --------------------------------------

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

        throw new AppError(
            "User not found",
            404
        );

    }


    const targetUser =
        userResult.rows[0];


    // --------------------------------------
    // 6. Target must be workspace member
    // --------------------------------------

    const teamMemberResult = await pool.query(
        `
        SELECT
            user_id
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
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


    // --------------------------------------
    // 7. Check duplicate project member
    // --------------------------------------

    const existingMemberResult =
        await pool.query(
            `
            SELECT
                id
            FROM project_members
            WHERE project_id = $1
            AND user_id = $2
            `,
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


    // --------------------------------------
    // 8. Add as Contributor
    // --------------------------------------

    const memberResult = await pool.query(
        `
        INSERT INTO project_members
        (
            project_id,
            user_id,
            role,
            added_by
        )
        VALUES
        (
            $1,
            $2,
            'Contributor',
            $3
        )
        RETURNING
            id,
            project_id,
            user_id,
            role,
            added_by,
            created_at
        `,
        [
            projectId,
            userId,
            addedBy
        ]
    );


    // --------------------------------------
    // 9. LOG ACTIVITY
    // --------------------------------------

    await logActivity(
        projectId,
        null,
        addedBy,
        "MEMBER_ADDED",
        `Added ${targetUser.name} to project "${project.name}"`
    );


    return {

        project: project,

        member: memberResult.rows[0],

        user: targetUser

    };

};



// ======================================================
// REMOVE PROJECT MEMBER
// ======================================================

export const removeProjectMemberService = async (
    projectId,
    userId,
    removedBy
) => {

    // --------------------------------------
    // 1. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by,
            team_id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------------
    // 2. Check requester is workspace member
    // --------------------------------------

    await verifyTeamMember(
        project.team_id,
        removedBy
    );


    // --------------------------------------
    // 3. Check requester project membership
    // --------------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            removedBy
        ]
    );


    const isProjectOwner =
        String(project.created_by) ===
        String(removedBy);


    if (
        !isProjectOwner &&
        requesterResult.rows.length === 0
    ) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 4. Check remove permission
    // --------------------------------------

    if (!isProjectOwner) {

        const requesterRole =
            requesterResult.rows[0].role;


        if (
            requesterRole !== "Owner" &&
            requesterRole !== "Manager"
        ) {

            throw new AppError(
                "You do not have permission to remove project members",
                403
            );

        }

    }


    // --------------------------------------
    // 5. Find target member
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            id,
            project_id,
            user_id,
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "User is not a member of this project",
            404
        );

    }


    const member =
        memberResult.rows[0];


    // --------------------------------------
    // 6. Get target user
    // --------------------------------------

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


    const targetUser =
        userResult.rows[0];


    // --------------------------------------
    // 7. Prevent removing project owner
    // --------------------------------------

    if (
        String(project.created_by) ===
        String(userId) ||
        member.role === "Owner"
    ) {

        throw new AppError(
            "Project owner cannot be removed",
            403
        );

    }


    // --------------------------------------
    // 8. Manager cannot remove Manager
    // --------------------------------------

    if (
        !isProjectOwner &&
        requesterResult.rows[0].role === "Manager" &&
        member.role === "Manager"
    ) {

        throw new AppError(
            "Managers cannot remove another manager",
            403
        );

    }


    // --------------------------------------
    // 9. Remove member
    // --------------------------------------

    await pool.query(
        `
        DELETE FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    // --------------------------------------
    // 10. LOG ACTIVITY
    // --------------------------------------

    await logActivity(
        projectId,
        null,
        removedBy,
        "MEMBER_REMOVED",
        `Removed ${targetUser?.name || "a member"} from project "${project.name}"`
    );


    return member;

};



// ======================================================
// GET PROJECT MEMBERS
// ======================================================

export const getProjectMembersService = async (
    projectId,
    requesterId
) => {

    // --------------------------------------
    // 1. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by,
            team_id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------------
    // 2. Check workspace membership
    // --------------------------------------

    await verifyTeamMember(
        project.team_id,
        requesterId
    );


    // --------------------------------------
    // 3. Check project membership
    // --------------------------------------

    const requesterResult = await pool.query(
        `
        SELECT
            project_id,
            user_id,
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            requesterId
        ]
    );


    const isProjectOwner =
        String(project.created_by) ===
        String(requesterId);


    if (
        !isProjectOwner &&
        requesterResult.rows.length === 0
    ) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 4. Get project members
    // --------------------------------------

    const membersResult = await pool.query(
        `
        SELECT
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
            ON u.id = pm.user_id
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
            pm.created_at ASC
        `,
        [projectId]
    );


    return {

        project: {
            id: project.id,
            name: project.name,
            created_by: project.created_by
        },

        members: membersResult.rows

    };

};



// ======================================================
// CHANGE PROJECT MEMBER ROLE
// ======================================================

export const updateProjectMemberRoleService = async (
    projectId,
    userId,
    newRole,
    requesterId
) => {

    // --------------------------------------
    // 1. Validate role
    // --------------------------------------

    const allowedRoles = [
        "Owner",
        "Manager",
        "Developer",
        "Contributor",
        "Viewer"
    ];


    if (!allowedRoles.includes(newRole)) {

        throw new AppError(
            "Invalid project role",
            400
        );

    }


    // --------------------------------------
    // 2. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by,
            team_id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------------
    // 3. Check requester workspace membership
    // --------------------------------------

    await verifyTeamMember(
        project.team_id,
        requesterId
    );


    // --------------------------------------
    // 4. Check requester project membership
    // --------------------------------------

    const requesterResult = await pool.query(
        `
        SELECT role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            requesterId
        ]
    );


    const isProjectOwner =
        String(project.created_by) ===
        String(requesterId);


    if (
        !isProjectOwner &&
        requesterResult.rows.length === 0
    ) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 5. Only Owner can change roles
    // --------------------------------------

    if (!isProjectOwner) {

        if (
            requesterResult.rows[0].role !== "Owner"
        ) {

            throw new AppError(
                "Only the project owner can change member roles",
                403
            );

        }

    }


    // --------------------------------------
    // 6. Find target member
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            id,
            project_id,
            user_id,
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "User is not a member of this project",
            404
        );

    }


    const member =
        memberResult.rows[0];


    // --------------------------------------
    // 7. Owner role cannot be changed
    // --------------------------------------

    if (
        member.role === "Owner" ||
        String(project.created_by) === String(userId)
    ) {

        throw new AppError(
            "Project owner's role cannot be changed",
            403
        );

    }


    // --------------------------------------
    // 8. Save old role
    // --------------------------------------

    const oldRole =
        member.role;


    // --------------------------------------
    // 9. Update role
    // --------------------------------------

    const result = await pool.query(
        `
        UPDATE project_members
        SET role = $1
        WHERE project_id = $2
        AND user_id = $3
        RETURNING
            id,
            project_id,
            user_id,
            role,
            added_by,
            created_at
        `,
        [
            newRole,
            projectId,
            userId
        ]
    );


    const updatedMember =
        result.rows[0];


    // --------------------------------------
    // 10. LOG ACTIVITY
    // --------------------------------------

    await logActivity(
        projectId,
        null,
        requesterId,
        "MEMBER_ROLE_CHANGED",
        `Changed project member role from ${oldRole} to ${newRole}`
    );


    return updatedMember;

};



// ======================================================
// LEAVE PROJECT
// ======================================================

export const leaveProjectService = async (
    projectId,
    userId
) => {

    // --------------------------------------
    // 1. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by,
            team_id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    const project =
        projectResult.rows[0];


    // --------------------------------------
    // 2. Check workspace membership
    // --------------------------------------

    await verifyTeamMember(
        project.team_id,
        userId
    );


    // --------------------------------------
    // 3. Check project membership
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            id,
            project_id,
            user_id,
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            404
        );

    }


    const member =
        memberResult.rows[0];


    // --------------------------------------
    // 4. Owner cannot leave
    // --------------------------------------

    if (
        String(project.created_by) ===
        String(userId) ||
        member.role === "Owner"
    ) {

        throw new AppError(
            "Project owner cannot leave the project. Transfer ownership first.",
            403
        );

    }


    // --------------------------------------
    // 5. Remove current user
    // --------------------------------------

    await pool.query(
        `
        DELETE FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    // --------------------------------------
    // 6. LOG ACTIVITY
    // --------------------------------------

    await logActivity(
        projectId,
        null,
        userId,
        "MEMBER_LEFT",
        `Left project "${project.name}"`
    );


    return member;

};

export const getMyProjectChats = async (teamId, userId) => {

    // -----------------------------------------
    // 1. Verify team membership
    // -----------------------------------------

    const teamMemberResult = await pool.query(
        `
        SELECT 1
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [
            teamId,
            userId
        ]
    );

    if (teamMemberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }


    // -----------------------------------------
    // 2. Get only user's project memberships
    // -----------------------------------------

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.name,
            p.description,
            p.created_at,
            pm.role
        FROM projects p
        INNER JOIN project_members pm
            ON pm.project_id = p.id
        WHERE p.team_id = $1
        AND pm.user_id = $2
        ORDER BY p.created_at DESC
        `,
        [
            teamId,
            userId
        ]
    );


    return result.rows;
};