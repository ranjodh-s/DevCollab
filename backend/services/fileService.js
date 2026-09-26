import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";

import AppError from "../utils/AppError.js";


// ==========================================
// SAVE FILE
// ==========================================

export const saveFile = async ({
    file,
    uploadedBy,
    projectId,
    taskId = null
}) => {

    // --------------------------------------
    // 1. Check file
    // --------------------------------------

    if (!file) {

        throw new AppError(
            "File is required",
            400
        );

    }


    // --------------------------------------
    // 2. Check projectId
    // --------------------------------------

    if (!projectId) {

        await fs.unlink(file.path).catch(() => {});

        throw new AppError(
            "projectId is required",
            400
        );

    }


    // --------------------------------------
    // 3. Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );

    if (projectResult.rows.length === 0) {

        await fs.unlink(file.path).catch(() => {});

        throw new AppError(
            "Project not found",
            404
        );

    }


    // --------------------------------------
    // 4. Check user is project member
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            team_id,
            user_id,
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            uploadedBy
        ]
    );

    if (memberResult.rows.length === 0) {

        await fs.unlink(file.path).catch(() => {});

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 5. If taskId supplied,
    //    check task exists
    // --------------------------------------

    if (taskId) {

        const taskResult = await pool.query(
            `
            SELECT
                id,
                project_id
            FROM tasks
            WHERE id = $1
            `,
            [taskId]
        );


        if (taskResult.rows.length === 0) {

            await fs.unlink(file.path).catch(() => {});

            throw new AppError(
                "Task not found",
                404
            );

        }


        // ----------------------------------
        // 6. Check task belongs to project
        // ----------------------------------

        if (
            taskResult.rows[0].project_id
            !== Number(projectId)
        ) {

            await fs.unlink(file.path).catch(() => {});

            throw new AppError(
                "Task does not belong to this project",
                400
            );

        }

    }


    // --------------------------------------
    // 7. Database file path
    // --------------------------------------

    const filePath =
        `/uploads/${file.filename}`;


    try {

        // ----------------------------------
        // 8. Save metadata
        // ----------------------------------

        const result = await pool.query(
            `
            INSERT INTO files (
                original_name,
                stored_name,
                mime_type,
                size,
                file_path,
                uploaded_by,
                project_id,
                task_id
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8
            )
            RETURNING
                id,
                original_name,
                stored_name,
                mime_type,
                size,
                file_path,
                uploaded_by,
                project_id,
                task_id,
                created_at
            `,
            [
                file.originalname,
                file.filename,
                file.mimetype,
                file.size,
                filePath,
                uploadedBy,
                projectId,
                taskId || null
            ]
        );


        return result.rows[0];

    } catch (error) {

        // ----------------------------------
        // Delete physical file if DB fails
        // ----------------------------------

        await fs.unlink(file.path).catch(() => {});

        throw error;

    }

};

// ==========================================
// GET PROJECT FILES
// ==========================================

export const getProjectFiles = async (
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
            name
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


    // --------------------------------------
    // 2. Check user is project member
    // --------------------------------------

    const memberResult = await pool.query(
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
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 3. Get project files
    // --------------------------------------

    const filesResult = await pool.query(
        `
        SELECT
            f.id,
            f.original_name,
            f.stored_name,
            f.mime_type,
            f.size,
            f.file_path,
            f.uploaded_by,
            f.project_id,
            f.task_id,
            f.created_at,

            u.name AS uploader_name,
            u.email AS uploader_email

        FROM files f

        LEFT JOIN users u
            ON u.id = f.uploaded_by

        WHERE f.project_id = $1

        ORDER BY f.created_at DESC
        `,
        [projectId]
    );


    return {

        project: projectResult.rows[0],

        files: filesResult.rows

    };

};

// ==========================================
// GET FILE BY ID
// ==========================================

export const getFileById = async (
    fileId,
    userId
) => {

    // --------------------------------------
    // 1. Get file + project membership
    // --------------------------------------

    const result = await pool.query(
        `
        SELECT
            f.id,
            f.original_name,
            f.stored_name,
            f.mime_type,
            f.size,
            f.file_path,
            f.uploaded_by,
            f.project_id,
            f.task_id,
            f.created_at,

            p.name AS project_name,

            u.name AS uploader_name,
            u.email AS uploader_email

        FROM files f

        INNER JOIN projects p
            ON p.id = f.project_id

        LEFT JOIN users u
            ON u.id = f.uploaded_by

        WHERE f.id = $1
        `,
        [fileId]
    );


    // --------------------------------------
    // 2. File not found
    // --------------------------------------

    if (result.rows.length === 0) {

        throw new AppError(
            "File not found",
            404
        );

    }


    const file = result.rows[0];


    // --------------------------------------
    // 3. Check project membership
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            file.project_id,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    return file;

};

// ==========================================
// DELETE FILE
// ==========================================

export const deleteFile = async (
    fileId,
    userId
) => {

    // --------------------------------------
    // 1. Get file + project information
    // --------------------------------------

    const fileResult = await pool.query(
        `
        SELECT
            f.id,
            f.original_name,
            f.stored_name,
            f.file_path,
            f.project_id,
            f.uploaded_by,

            p.created_by

        FROM files f

        INNER JOIN projects p
            ON p.id = f.project_id

        WHERE f.id = $1
        `,
        [fileId]
    );


    // --------------------------------------
    // 2. Check file exists
    // --------------------------------------

    if (fileResult.rows.length === 0) {

        throw new AppError(
            "File not found",
            404
        );

    }


    const file = fileResult.rows[0];


    // --------------------------------------
    // 3. Check requester membership
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            file.project_id,
            userId
        ]
    );


    const isProjectOwner =
        file.created_by === userId;


    if (
        !isProjectOwner &&
        memberResult.rows.length === 0
    ) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 4. Check delete permission
    // --------------------------------------

    if (!isProjectOwner) {

        const role =
            memberResult.rows[0].role;

        if (
            role !== "Owner" &&
            role !== "Manager"
        ) {

            throw new AppError(
                "You do not have permission to delete this file",
                403
            );

        }

    }


    // --------------------------------------
    // 5. Delete physical file
    // --------------------------------------

    const physicalPath =
        path.resolve(
            "uploads",
            file.stored_name
        );


    try {

        await fs.unlink(
            physicalPath
        );

    } catch (error) {

        // File may already have been
        // manually deleted from disk.

        if (error.code !== "ENOENT") {

            throw error;

        }

    }


    // --------------------------------------
    // 6. Delete database record
    // --------------------------------------

    await pool.query(
        `
        DELETE FROM files
        WHERE id = $1
        `,
        [fileId]
    );


    return file;

};

// ==========================================
// GET TASK FILES
// ==========================================

export const getTaskFiles = async (
    taskId,
    userId
) => {

    // --------------------------------------
    // 1. Check task exists
    // --------------------------------------

    const taskResult = await pool.query(
        `
        SELECT
            id,
            project_id,
            title
        FROM tasks
        WHERE id = $1
        `,
        [taskId]
    );

    if (taskResult.rows.length === 0) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    const task = taskResult.rows[0];


    // --------------------------------------
    // 2. Check project membership
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            task.project_id,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    // --------------------------------------
    // 3. Get task files
    // --------------------------------------

    const filesResult = await pool.query(
        `
        SELECT
            f.id,
            f.original_name,
            f.stored_name,
            f.mime_type,
            f.size,
            f.file_path,
            f.uploaded_by,
            f.project_id,
            f.task_id,
            f.created_at,

            u.name AS uploader_name,
            u.email AS uploader_email

        FROM files f

        LEFT JOIN users u
            ON u.id = f.uploaded_by

        WHERE f.task_id = $1

        ORDER BY f.created_at DESC
        `,
        [taskId]
    );


    return {
        task,
        files: filesResult.rows
    };

};