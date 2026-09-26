import express from "express";
import "dotenv/config";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socket.js";
import { setIO } from "./socket/socketInstance.js";
import reactionRoutes from "./routes/reactionRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import teamInvitationRoutes from "./routes/teamInvitationRoutes.js";
import teamJoinRequestRoutes from "./routes/teamJoinRequestRoutes.js";
import fileRoutes from "./routes/fileRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectMemberRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api", teamInvitationRoutes);
app.use("/api", teamJoinRequestRoutes);
app.use("/api/files", fileRoutes);
app.use("/api", chatRoutes);



app.use(errorHandler);


app.get("/", (req, res) => {
    res.send("DevCollab API Running");
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json(err.message);
    }
});



const server = http.createServer(app);

const io = new Server(server, {

    cors: {

        origin: [process.env.FRONTEND_URL],

        credentials: true

    }

});

setIO(io);

initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });