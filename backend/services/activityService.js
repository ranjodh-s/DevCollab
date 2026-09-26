import pool from "../config/db.js";
import { getProjectById } from "../utils/project.js";
import { verifyTeamMember } from "../utils/authorization.js";

export const logActivity = async (
    projectId,
    taskId,
    userId,
    action,
    details
) => {

    const result = await pool.query(
        `INSERT INTO activity_logs
    (
        project_id,
        task_id,
        user_id,
        action,
        details
    )
    VALUES($1,$2,$3,$4,$5)
    RETURNING *`,
        [
            projectId,
            taskId,
            userId,
            action,
            details
        ]
    );

    return result.rows[0];

};

export const getProjectActivityService = async (
    projectId,
    userId
) => {

    // Check project exists
    const project =
        await getProjectById(projectId);

    // Verify permission
    await verifyTeamMember(
        project.team_id,
        userId
    );

    // Fetch activity
    const result = await pool.query(
        `SELECT
            al.id,
            al.action,
            al.details,
            al.created_at,

            u.id AS user_id,
            u.name AS user_name,

            t.id AS task_id,
            t.title AS task_title

        FROM activity_logs al

        JOIN users u
            ON al.user_id=u.id

        LEFT JOIN tasks t
            ON al.task_id=t.id

        WHERE al.project_id=$1

        ORDER BY
            al.created_at DESC`,
        [projectId]
    );

    return result.rows;

};

export const logTeamActivity = async (
    teamId,
    userId,
    action,
    details
) => {
    const result = await pool.query(
        `
        INSERT INTO team_activity_logs
        (
            team_id,
            user_id,
            action,
            details
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            teamId,
            userId,
            action,
            details
        ]
    );

    return result.rows[0];
};




export const getTeamActivityService = async (
    teamId,
    userId
) => {
    await verifyTeamMember(teamId, userId);

    const result = await pool.query(
        `
        SELECT
            tal.id,
            tal.team_id,
            tal.action,
            tal.details,
            tal.created_at,
            u.id AS user_id,
            u.name AS user_name
        FROM team_activity_logs tal
        JOIN users u
            ON tal.user_id = u.id
        WHERE tal.team_id = $1
        ORDER BY tal.created_at DESC
        `,
        [teamId]
    );

    return result.rows;
};