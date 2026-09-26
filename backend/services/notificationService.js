import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { getIO } from "../socket/socketInstance.js";

const getNotificationDetails = async (notificationId) => {

    const result = await pool.query(
        `
        SELECT

            n.id,
            n.is_read,
            n.created_at,

            al.action,
            al.details,

            u.id AS user_id,
            u.name AS user_name,

            t.id AS task_id,
            t.title AS task_title,

            p.id AS project_id,
            p.name AS project_name

        FROM notifications n

        JOIN activity_logs al
        ON n.activity_id = al.id

        JOIN users u
        ON al.user_id = u.id

        LEFT JOIN tasks t
        ON al.task_id = t.id

        LEFT JOIN projects p
        ON al.project_id = p.id

        WHERE n.id = $1
        `,
        [notificationId]
    );

    return result.rows[0];

};

export const getNotificationsService = async (
    userId
) => {

    const result = await pool.query(
        `SELECT

            n.id,
            n.is_read,
            n.created_at,

            al.action,
            al.details,

            u.name AS user_name,

            t.title AS task_title

        FROM notifications n

        JOIN activity_logs al
            ON n.activity_id = al.id

        JOIN users u
            ON al.user_id = u.id

        LEFT JOIN tasks t
            ON al.task_id = t.id

        WHERE n.user_id = $1

        ORDER BY
            n.created_at DESC`,
        [userId]
    );

    return result.rows;

};

export const createNotification = async (
    userId,
    activityId
) => {

    const result = await pool.query(
        `INSERT INTO notifications
        (
            user_id,
            activity_id
        )
        VALUES($1,$2)
        returning id`,
        [
            userId,
            activityId
        ]
    );

    console.log(result.rows)

    const notification = await getNotificationDetails(
        result.rows[0].id
    );

    // const notification = result.rows[0];

    const io = getIO();

    io.to(`user-${userId}`).emit(
        "notification",
        notification
    );

    return notification;
};

export const markNotificationReadService = async (
    notificationId,
    userId
) => {

    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1
         AND user_id = $2
         RETURNING *`,
        [
            notificationId,
            userId
        ]
    );

    if (result.rows.length === 0) {

        throw new AppError(
            "Notification not found",
            404
        );

    }

    return result.rows[0];

};

export const markAllNotificationsReadService = async (
    userId
) => {

    await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1`,
        [userId]
    );

};

