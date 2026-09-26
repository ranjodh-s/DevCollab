import pool from "../config/db.js";


// ==========================================
// JOIN PROJECT ROOM
// ==========================================

export const joinProjectRoom = async (
    socket,
    projectId
) => {

    try {

        // ======================================
        // CHECK PROJECT MEMBERSHIP
        // ======================================

        const result = await pool.query(
            `
            SELECT 1
            FROM project_members
            WHERE project_id = $1
            AND user_id = $2
            `,
            [
                projectId,
                socket.user.id
            ]
        );


        // ======================================
        // USER IS NOT A PROJECT MEMBER
        // ======================================

        if (result.rows.length === 0) {

            console.log(
                `❌ User ${socket.user.id} is NOT a member of project-${projectId}`
            );


            return {
                success: false,
                message:
                    "You are not a member of this project"
            };

        }


        // ======================================
        // JOIN PROJECT ROOM
        // ======================================

        const roomName =
            `project-${projectId}`;


        socket.join(roomName);


        console.log(
            `🟢 User ${socket.user.id} joined ${roomName}`
        );


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        return {
            success: true,
            message:
                "Joined project successfully"
        };


    } catch (error) {

        // ======================================
        // ERROR
        // ======================================

        console.error(
            "❌ Project room error:",
            error
        );


        return {
            success: false,
            message:
                "Failed to join project"
        };

    }

};