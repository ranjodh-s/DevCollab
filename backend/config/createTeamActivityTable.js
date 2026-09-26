import pool from "../config/db.js";

const createTeamActivityTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS team_activity_logs (
                id SERIAL PRIMARY KEY,
                team_id INTEGER NOT NULL
                    REFERENCES teams(id)
                    ON DELETE CASCADE,

                user_id INTEGER NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                action VARCHAR(100) NOT NULL,
                details TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_team_activity_logs_team
            ON team_activity_logs(team_id);

            CREATE INDEX IF NOT EXISTS idx_team_activity_logs_created_at
            ON team_activity_logs(created_at DESC);
        `);

        console.log("team_activity_logs table ready");
    } catch (error) {
        console.error(
            "Failed to create team_activity_logs table:",
            error
        );
    }
};

createTeamActivityTable();