import pool from "../config/db.js";
import AppError from "./AppError.js";

export const getCommentById = async (
    commentId
)=>{

    const result = await pool.query(
        `SELECT *
         FROM comments
         WHERE id=$1`,
        [commentId]
    );

    if(result.rows.length===0){

        throw new AppError(
            "Comment not found",
            404
        );

    }

    return result.rows[0];

};