import pool from "../config/db.js";

export const getUserTeams = async (userId) => {

    const result = await pool.query(
        `
        SELECT team_id
        FROM team_members
        WHERE user_id=$1
        `,
        [userId]
    );

    return result.rows;

};