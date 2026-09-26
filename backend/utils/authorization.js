import pool from "../config/db.js";
import AppError from "./AppError.js";

export const verifyTeamMember = async (
    teamId,
    userId
) => {

    const result = await pool.query(
        `SELECT *
         FROM team_members
         WHERE team_id=$1
         AND user_id=$2`,
        [teamId, userId]
    );

    if(result.rows.length===0){

        throw new AppError(
            "You are not a member of this team",
            403
        );

    }

};