import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { getCommentById } from "../utils/comment.js";
import { getTaskById } from "../utils/task.js";
import { getProjectById } from "../utils/project.js";
import { verifyTeamMember } from "../utils/authorization.js";
import { logActivity } from "./activityService.js";


export const createCommentService = async (
    taskId,
    comment,
    userId
) => {

    // Check if task exists
    const task = await getTaskById(taskId);

    // Get project
    const project = await getProjectById(
        task.project_id
    );

    // Verify user belongs to the team
    await verifyTeamMember(
        project.team_id,
        userId
    );

    // Insert comment
    const result = await pool.query(
        `INSERT INTO comments
        (
            task_id,
            user_id,
            comment
        )
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
            taskId,
            userId,
            comment
        ]
    );

    // Log activity
    await logActivity(
    project.id,
    task.id,
    userId,
    "COMMENT_ADDED",
    "Added a comment"
);

    return result.rows[0];

};

export const getCommentsByTaskService = async (
    taskId,
    userId
)=>{

    // Check task exists
    const task = await getTaskById(taskId);

    // Find project
    const project = await getProjectById(
        task.project_id
    );

    // Verify team member
    await verifyTeamMember(
        project.team_id,
        userId
    );

    // Fetch comments
    const result = await pool.query(
        `SELECT
            c.id,
            c.comment,
            c.created_at,
            c.updated_at,
            u.id AS user_id,
            u.name AS user_name
        FROM comments c
        JOIN users u
            ON c.user_id = u.id
        WHERE c.task_id = $1
        ORDER BY c.created_at ASC`,
        [taskId]
    );

    return result.rows;

};


export const updateCommentService = async (
    commentId,
    comment,
    userId
)=>{

    // Find comment
    const existingComment =
        await getCommentById(commentId);

    // Find task
    const task = await getTaskById(
        existingComment.task_id
    );

    // Find project
    const project = await getProjectById(
        task.project_id
    );

    // Verify team membership
    await verifyTeamMember(
        project.team_id,
        userId
    );

    // Only comment owner can edit
    if(existingComment.user_id !== userId){

        throw new AppError(
            "You can only edit your own comments",
            403
        );

    }

    // Update comment
    const result = await pool.query(
        `UPDATE comments
         SET
            comment=$1,
            updated_at=CURRENT_TIMESTAMP
         WHERE id=$2
         RETURNING *`,
        [
            comment,
            commentId
        ]
    );

    // Log activity
    await logActivity(
    project.id,
    task.id,
    userId,
    "COMMENT_UPDATED",
    "Updated a comment"
);

    return result.rows[0];

};

export const deleteCommentService = async (
    commentId,
    userId
)=>{

    // Find comment
    const existingComment =
        await getCommentById(commentId);

    // Find task
    const task = await getTaskById(
        existingComment.task_id
    );

    // Find project
    const project = await getProjectById(
        task.project_id
    );

    // Verify user belongs to team
    await verifyTeamMember(
        project.team_id,
        userId
    );

    // Only comment owner can delete
    if(existingComment.user_id !== userId){

        throw new AppError(
            "You can only delete your own comments",
            403
        );

    }

    // Log activity
    await logActivity(
    project.id,
    task.id,
    userId,
    "COMMENT_DELETED",
    "Deleted a comment"
);

    // Delete comment
    await pool.query(
        `DELETE FROM comments
         WHERE id=$1`,
        [commentId]
    );

};