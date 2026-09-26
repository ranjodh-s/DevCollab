import jwt from "jsonwebtoken";
import { getUserTeams } from "../utils/team.js";
import { joinProjectRoom } from "./projectSocket.js";

let socketIO = null;


// ==========================================
// GET SOCKET.IO INSTANCE
// ==========================================

export const getIO = () => {

    if (!socketIO) {

        throw new Error(
            "Socket.IO has not been initialized"
        );

    }

    return socketIO;

};


// ==========================================
// INITIALIZE SOCKET.IO
// ==========================================

export const initializeSocket = (io) => {

    socketIO = io;


    // ==========================================
    // SOCKET AUTHENTICATION
    // ==========================================

    io.use((socket, next) => {

        try {

            const token =
                socket.handshake.auth?.token;


            if (!token) {

                return next(
                    new Error(
                        "Authentication failed"
                    )
                );

            }


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );


            socket.user = decoded;


            next();

        } catch (error) {

            console.error(
                "❌ Socket authentication error:",
                error
            );


            next(
                new Error(
                    "Authentication failed"
                )
            );

        }

    });


    // ==========================================
    // CONNECTION
    // ==========================================

    io.on(
        "connection",
        (socket) => {

            console.log(
                `🟢 User ${socket.user.id} connected`
            );

            console.log(
                "Socket ID:",
                socket.id
            );


            // ======================================
            // USER ROOM
            // ======================================

            socket.join(
                `user-${socket.user.id}`
            );


            console.log(
                `Joined room user-${socket.user.id}`
            );


            // ======================================
            // JOIN PROJECT
            // ======================================

            socket.on(
                "join-project",
                async (
                    projectId,
                    callback
                ) => {

                    console.log(
                        "📥 JOIN PROJECT EVENT:",
                        projectId
                    );


                    try {

                        const numericProjectId =
                            Number(projectId);


                        // ------------------------------
                        // Validate project ID
                        // ------------------------------

                        if (
                            !Number.isInteger(
                                numericProjectId
                            ) ||
                            numericProjectId <= 0
                        ) {

                            const response = {
                                success: false,
                                message:
                                    "Invalid project ID"
                            };


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                callback(response);

                            }


                            return;

                        }


                        console.log(
                            `User ${socket.user.id} requesting project-${numericProjectId}`
                        );


                        // ------------------------------
                        // Check membership + join room
                        // ------------------------------

                        const result =
                            await joinProjectRoom(
                                socket,
                                numericProjectId
                            );


                        console.log(
                            "📡 Join project result:",
                            result
                        );


                        // ------------------------------
                        // Send response to frontend
                        // ------------------------------

                        if (
                            typeof callback ===
                            "function"
                        ) {

                            callback(result);

                        }


                    } catch (error) {

                        console.error(
                            "❌ Join project socket error:",
                            error
                        );


                        if (
                            typeof callback ===
                            "function"
                        ) {

                            callback({
                                success: false,
                                message:
                                    "Failed to join project"
                            });

                        }

                    }

                }
            );


            // ======================================
            // LEAVE PROJECT
            // ======================================

            socket.on(
                "leave-project",
                (projectId) => {

                    const numericProjectId =
                        Number(projectId);


                    if (
                        !Number.isInteger(
                            numericProjectId
                        ) ||
                        numericProjectId <= 0
                    ) {

                        return;

                    }


                    socket.leave(
                        `project-${numericProjectId}`
                    );


                    console.log(
                        `👋 User ${socket.user.id} left project-${numericProjectId}`
                    );

                }
            );


            // ======================================
            // SOCKET EVENTS DEBUG
            // ======================================

            socket.onAny(
                (event, ...args) => {

                    console.log(
                        "📡 SOCKET EVENT:",
                        event,
                        args
                    );

                }
            );


            // ======================================
            // TEAM ROOMS
            // ======================================

            /*
             * This is intentionally async,
             * but it does NOT block registration
             * of the socket event handlers above.
             */

            getUserTeams(
                socket.user.id
            )
                .then((teams) => {

                    for (const team of teams) {

                        socket.join(
                            `team-${team.team_id}`
                        );


                        console.log(
                            `Joined room team-${team.team_id}`
                        );

                    }

                })
                .catch((error) => {

                    console.error(
                        "❌ Error joining team rooms:",
                        error
                    );

                });


            // ======================================
            // DISCONNECT
            // ======================================

            socket.on(
                "disconnect",
                (reason) => {

                    console.log(
                        `🔴 User ${socket.user.id} disconnected`
                    );


                    console.log(
                        "Reason:",
                        reason
                    );

                }
            );

        }
    );

};