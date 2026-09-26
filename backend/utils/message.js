import pool from "../config/db.js";

export const getMessageById = async (
    messageId
)=>{
    const result = await pool.query(
        `
        SELECT *
        FROM messages
        WHERE id=$1
        `,
        [messageId]
    );

    if(result.rows.length===0){

        throw new AppError(
            "Message not found",
            404
        );

    }

    return result.rows[0];
};