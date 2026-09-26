import pool from "../config/db.js";
import AppError from "./AppError.js";

export const getTaskById = async (taskId) => {

    const result = await pool.query(
        `SELECT *
         FROM tasks
         WHERE id = $1`,
        [taskId]
    );

    if (result.rows.length === 0) {
        throw new AppError(
            "Task not found",
            404
        );
    }

    return result.rows[0];

};