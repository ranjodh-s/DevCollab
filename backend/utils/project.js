import pool from "../config/db.js";
import AppError from "./AppError.js";


export const getProjectById = async(projectId)=>{

    const result=await pool.query(
        `SELECT *
         FROM projects
         WHERE id=$1`,
         [projectId]
    );

    if(result.rows.length===0){

        throw new AppError(
            "Project not found",
            404
        );

    }

    return result.rows[0];

}