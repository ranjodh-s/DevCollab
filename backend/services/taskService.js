import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { getTaskById } from "../utils/task.js";
import { getProjectById } from "../utils/project.js";
import { verifyTeamMember } from "../utils/authorization.js";
import { logActivity } from "./activityService.js";
import { createNotification } from "./notificationService.js";
import { getIO } from "../socket/socketInstance.js";


// =====================================================
// CREATE TASK
// =====================================================

export const createTaskService = async (
    projectId,
    title,
    description,
    priority,
    assignedTo,
    dueDate,
    userId
) => {

    const project = await getProjectById(projectId);

    await verifyTeamMember(
        project.team_id,
        userId
    );

    if (assignedTo) {

        const assigneeResult = await pool.query(
            `SELECT *
             FROM team_members
             WHERE team_id = $1
             AND user_id = $2`,
            [
                project.team_id,
                assignedTo
            ]
        );

        if (assigneeResult.rows.length === 0) {

            throw new AppError(
                "Assigned user is not a member of this team",
                400
            );

        }
    }


    const result = await pool.query(
        `INSERT INTO tasks
        (
            project_id,
            title,
            description,
            priority,
            assigned_to,
            due_date,
            created_by
        )
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
            projectId,
            title,
            description || "",
            priority || "Medium",
            assignedTo || null,
            dueDate || null,
            userId
        ]
    );


    const task = result.rows[0];


    const activity = await logActivity(
        project.id,
        task.id,
        userId,
        "TASK_CREATED",
        `Created task "${title}"`
    );


    if (
        assignedTo &&
        String(assignedTo) !== String(userId)
    ) {

        await createNotification(
            assignedTo,
            activity.id
        );

    }


    return task;
};


// =====================================================
// GET TASKS BY PROJECT
// =====================================================

export const getTasksByProjectService = async (
    projectId,
    userId
) => {

    const project = await getProjectById(projectId);

    await verifyTeamMember(
        project.team_id,
        userId
    );


    const result = await pool.query(
        `SELECT
            t.*,
            u.name AS assigned_to_name,
            c.name AS created_by_name
        FROM tasks t
        LEFT JOIN users u
            ON t.assigned_to = u.id
        LEFT JOIN users c
            ON t.created_by = c.id
        WHERE t.project_id = $1
        ORDER BY
            CASE t.status
                WHEN 'Todo' THEN 1
                WHEN 'In Progress' THEN 2
                WHEN 'Review' THEN 3
                WHEN 'Completed' THEN 4
                WHEN 'Done' THEN 5
                ELSE 6
            END,
            t.created_at DESC`,
        [projectId]
    );


    return result.rows;
};


// =====================================================
// UPDATE TASK STATUS
// =====================================================

export const updateTaskStatusService = async (
    taskId,
    status,
    userId
) => {

    const validStatuses = [
        "Todo",
        "In Progress",
        "Review",
        "Completed"
    ];


    if (!validStatuses.includes(status)) {

        throw new AppError(
            "Invalid task status",
            400
        );

    }


    const task = await getTaskById(taskId);

    const project = await getProjectById(
        task.project_id
    );


    await verifyTeamMember(
        project.team_id,
        userId
    );


    const result = await pool.query(
        `UPDATE tasks
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [
            status,
            taskId
        ]
    );


    const updatedTask = result.rows[0];


    // Socket update

    try {

        const io = getIO();

        io.to(
            `team-${project.team_id}`
        ).emit(
            "task-status-updated",
            updatedTask
        );

    } catch (socketError) {

        console.error(
            "Socket notification failed:",
            socketError
        );

    }


    // Activity

    const activity = await logActivity(
        project.id,
        taskId,
        userId,
        "STATUS_CHANGED",
        `Changed status from ${task.status} to ${status}`
    );


    // Notifications

    const notifyUsers = new Set();


    if (
        String(task.created_by) !==
        String(userId)
    ) {

        notifyUsers.add(
            task.created_by
        );

    }


    if (
        task.assigned_to &&
        String(task.assigned_to) !==
        String(userId)
    ) {

        notifyUsers.add(
            task.assigned_to
        );

    }


    for (const id of notifyUsers) {

        await createNotification(
            id,
            activity.id
        );

    }


    return updatedTask;
};


// =====================================================
// UPDATE TASK
// =====================================================

export const updateTaskService = async (
    taskId,
    title,
    description,
    priority,
    status,
    assignedTo,
    dueDate,
    userId
) => {

    // -----------------------------
    // VALIDATION
    // -----------------------------

    const validPriorities = [
        "Low",
        "Medium",
        "High",
        "Urgent"
    ];


    const validStatuses = [
        "Todo",
        "In Progress",
        "Review",
        "Completed"
    ];


    if (!validPriorities.includes(priority)) {

        throw new AppError(
            "Invalid priority",
            400
        );

    }


    if (!validStatuses.includes(status)) {

        throw new AppError(
            "Invalid task status",
            400
        );

    }


    // -----------------------------
    // GET EXISTING TASK
    // -----------------------------

    const task = await getTaskById(taskId);


    // -----------------------------
    // GET PROJECT
    // -----------------------------

    const project = await getProjectById(
        task.project_id
    );


    // -----------------------------
    // VERIFY USER
    // -----------------------------

    await verifyTeamMember(
        project.team_id,
        userId
    );


    // -----------------------------
    // VERIFY ASSIGNEE
    // -----------------------------

    if (assignedTo) {

        await verifyTeamMember(
            project.team_id,
            assignedTo
        );

    }


    // -----------------------------
    // UPDATE EVERYTHING
    // INCLUDING STATUS
    // -----------------------------

    const result = await pool.query(
        `UPDATE tasks
         SET
            title = $1,
            description = $2,
            priority = $3,
            status = $4,
            assigned_to = $5,
            due_date = $6
         WHERE id = $7
         RETURNING *`,
        [
            title,
            description || "",
            priority,
            status,
            assignedTo || null,
            dueDate || null,
            taskId
        ]
    );


    if (result.rows.length === 0) {

        throw new AppError(
            "Task not found",
            404
        );

    }


    const updatedTask = result.rows[0];


    // -----------------------------
    // ACTIVITY LOG
    // -----------------------------

    await logActivity(
        project.id,
        taskId,
        userId,
        "TASK_UPDATED",
        `Updated task "${task.title}"`
    );


    // -----------------------------
    // SOCKET UPDATE
    // -----------------------------

    try {

        const io = getIO();

        io.to(
            `team-${project.team_id}`
        ).emit(
            "task-updated",
            updatedTask
        );

    } catch (socketError) {

        console.error(
            "Socket notification failed:",
            socketError
        );

    }


    return updatedTask;
};


// =====================================================
// DELETE TASK
// =====================================================

export const deleteTaskService = async (
    taskId,
    userId
) => {

    const task = await getTaskById(taskId);


    const project = await getProjectById(
        task.project_id
    );


    await verifyTeamMember(
        project.team_id,
        userId
    );


    await logActivity(
        project.id,
        taskId,
        userId,
        "TASK_DELETED",
        `Deleted task "${task.title}"`
    );


    await pool.query(
        `DELETE FROM tasks
         WHERE id = $1`,
        [taskId]
    );

};

// ======================================================
// CHECK TEAM MEMBERSHIP
// ======================================================

const checkTeamAccess = async (
    teamId,
    userId
) => {

    const result = await pool.query(
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


    if (result.rows.length === 0) {

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }

};


// ======================================================
// GET ALL TEAM TASKS
// ======================================================

export const getTeamTasks = async (
    teamId,
    userId
) => {

    // ----------------------------------------------
    // Check team access
    // ----------------------------------------------

    await checkTeamAccess(
        teamId,
        userId
    );


    // ----------------------------------------------
    // Get tasks from all projects
    // ----------------------------------------------

    const result = await pool.query(
        `
        SELECT
            t.id,
            t.project_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.assigned_to,
            t.due_date,
            t.created_by,
            t.created_at,

            p.team_id,
            p.name AS project_name,

            assigned_user.name AS assigned_to_name,
            assigned_user.email AS assigned_to_email,

            creator.name AS created_by_name,
            creator.email AS created_by_email

        FROM tasks t

        INNER JOIN projects p
            ON p.id = t.project_id

        LEFT JOIN users assigned_user
            ON assigned_user.id = t.assigned_to

        LEFT JOIN users creator
            ON creator.id = t.created_by

        WHERE p.team_id = $1

        ORDER BY
            t.created_at DESC
        `,
        [
            teamId
        ]
    );


    return result.rows;

};