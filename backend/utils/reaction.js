import pool from "../config/db.js";
import AppError from "./AppError.js";

export const getReactionByUserAndMessage = async (
    messageId,
    userId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM message_reactions
        WHERE message_id = $1
        AND user_id = $2
        `,
        [messageId, userId]
    );

    return result.rows[0] || null;

};

export const getMessageReactions = async (
    messageId
) => {

    const result = await pool.query(
        `
        SELECT

            reaction,

            COUNT(*)::INT AS count,

            ARRAY_AGG(user_id) AS users

        FROM message_reactions

        WHERE message_id = $1

        GROUP BY reaction

        ORDER BY reaction
        `,
        [messageId]
    );

    return result.rows;

};

export const getReactionById = async (
    reactionId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM message_reactions
        WHERE id = $1
        `,
        [reactionId]
    );

    if (result.rows.length === 0) {

        throw new AppError(
            "Reaction not found",
            404
        );

    }

    return result.rows[0];

};