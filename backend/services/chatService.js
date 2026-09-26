import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import {
    getIO
} from "../socket/socketInstance.js";
import { joinProjectRoom } from "../socket/projectSocket.js";


// ==========================================
// CHECK PROJECT ACCESS
// ==========================================

const checkProjectAccess = async (
    projectId,
    userId
) => {

    // --------------------------------------
    // Check project exists
    // --------------------------------------

    const projectResult = await pool.query(
        `
        SELECT
            id,
            name,
            created_by
        FROM projects
        WHERE id = $1
        `,
        [projectId]
    );


    if (projectResult.rows.length === 0) {

        throw new AppError(
            "Project not found",
            404
        );

    }


    // --------------------------------------
    // Check project membership
    // --------------------------------------

    const memberResult = await pool.query(
        `
        SELECT
            role
        FROM project_members
        WHERE project_id = $1
        AND user_id = $2
        `,
        [
            projectId,
            userId
        ]
    );


    if (memberResult.rows.length === 0) {

        throw new AppError(
            "You are not a member of this project",
            403
        );

    }


    return {
        project: projectResult.rows[0],
        role: memberResult.rows[0].role
    };

};


// ==========================================
// GET PROJECT CHAT
// ==========================================

export const getProjectChat = async (
    projectId,
    userId
) => {

    // --------------------------------------
    // Check access
    // --------------------------------------

    await checkProjectAccess(
        projectId,
        userId
    );


    // --------------------------------------
    // Get chat
    // --------------------------------------

    let chatResult = await pool.query(
        `
        SELECT
            id,
            project_id,
            created_at
        FROM project_chats
        WHERE project_id = $1
        `,
        [projectId]
    );


    // --------------------------------------
    // Create chat if it doesn't exist
    // --------------------------------------

    if (chatResult.rows.length === 0) {

        chatResult = await pool.query(
            `
            INSERT INTO project_chats (
                project_id
            )
            VALUES ($1)
            RETURNING
                id,
                project_id,
                created_at
            `,
            [projectId]
        );

    }


    return chatResult.rows[0];

};


// ==========================================
// GET PROJECT MESSAGES
// ==========================================

export const getProjectMessages = async (
    projectId,
    userId,
    page = 1,
    limit = 20
) => {

    // --------------------------------------
    // Check project access
    // --------------------------------------

    await checkProjectAccess(
        projectId,
        userId
    );


    // --------------------------------------
    // Validate pagination
    // --------------------------------------

    page = Number(page);
    limit = Number(limit);


    if (
        !Number.isInteger(page) ||
        page < 1
    ) {

        throw new AppError(
            "Invalid page",
            400
        );

    }


    if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {

        throw new AppError(
            "Limit must be between 1 and 100",
            400
        );

    }


    // --------------------------------------
    // Get chat
    // --------------------------------------

    const chatResult = await pool.query(
        `
        SELECT id
        FROM project_chats
        WHERE project_id = $1
        `,
        [projectId]
    );


    if (chatResult.rows.length === 0) {

        throw new AppError(
            "Project chat not found",
            404
        );

    }


    const chatId =
        chatResult.rows[0].id;


    // --------------------------------------
    // Calculate offset
    // --------------------------------------

    const offset =
        (page - 1) * limit;


    // --------------------------------------
    // Get total messages
    // --------------------------------------

    const countResult =
        await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM project_messages
            WHERE chat_id = $1
            `,
            [chatId]
        );


    const total =
        Number(countResult.rows[0].total);


    // --------------------------------------
    // Get messages
    // --------------------------------------

    const messagesResult =
        await pool.query(
            `
            SELECT
                pm.id,
                pm.chat_id,
                pm.sender_id,
                pm.message,
                pm.created_at,
                pm.updated_at,

                u.name AS sender_name,
                u.email AS sender_email

            FROM project_messages pm

            INNER JOIN users u
                ON u.id = pm.sender_id

            WHERE pm.chat_id = $1

            ORDER BY pm.created_at DESC

            LIMIT $2
            OFFSET $3
            `,
            [
                chatId,
                limit,
                offset
            ]
        );

        


    // --------------------------------------
    // Calculate pagination
    // --------------------------------------

    const totalPages =
        Math.ceil(total / limit);


    return {

        chat_id: chatId,

        messages: messagesResult.rows,

        pagination: {

            page,

            limit,

            total,

            totalPages,

            hasNextPage:
                page < totalPages,

            hasPreviousPage:
                page > 1

        }

    };

};


// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = async (
    projectId,
    userId,
    message
) => {

    // --------------------------------------
    // Validate message
    // --------------------------------------

    if (
        !message ||
        !message.trim()
    ) {

        throw new AppError(
            "Message is required",
            400
        );

    }


    const trimmedMessage =
        message.trim();


    // --------------------------------------
    // Check access
    // --------------------------------------

    await checkProjectAccess(
        projectId,
        userId
    );


    // --------------------------------------
    // Get/create chat
    // --------------------------------------

    let chatResult = await pool.query(
        `
        SELECT id
        FROM project_chats
        WHERE project_id = $1
        `,
        [projectId]
    );


    let chatId;


    if (chatResult.rows.length === 0) {

        const newChat =
            await pool.query(
                `
                INSERT INTO project_chats (
                    project_id
                )
                VALUES ($1)
                RETURNING id
                `,
                [projectId]
            );

        chatId =
            newChat.rows[0].id;

    } else {

        chatId =
            chatResult.rows[0].id;

    }


    // --------------------------------------
    // Insert message
    // --------------------------------------

    const messageResult = await pool.query(
        `
        INSERT INTO project_messages (
            chat_id,
            sender_id,
            message
        )
        VALUES (
            $1,
            $2,
            $3
        )
        RETURNING
            id,
            chat_id,
            sender_id,
            message,
            created_at,
            updated_at
        `,
        [
            chatId,
            userId,
            trimmedMessage
        ]
    );


    // --------------------------------------
    // Get sender information
    // --------------------------------------

    const senderResult = await pool.query(
        `
        SELECT
            id,
            name,
            email
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    const newMessage = {

    ...messageResult.rows[0],

    sender_name:
        senderResult.rows[0].name,

    sender_email:
        senderResult.rows[0].email

};

    const io = getIO();

    

io.to(`project-${projectId}`).emit(
    "new-project-message",
    newMessage
);


    return newMessage;

};

// ==========================================
// EDIT MESSAGE
// ==========================================

export const editMessage = async (
    projectId,
    messageId,
    userId,
    message
) => {

    // --------------------------------------
    // Validate message
    // --------------------------------------

    if (
        !message ||
        !message.trim()
    ) {

        throw new AppError(
            "Message is required",
            400
        );

    }


    const trimmedMessage =
        message.trim();


    // --------------------------------------
    // Check project access
    // --------------------------------------

    await checkProjectAccess(
        projectId,
        userId
    );


    // --------------------------------------
    // Get message
    // --------------------------------------

    const messageResult =
        await pool.query(
            `
            SELECT
                pm.id,
                pm.chat_id,
                pm.sender_id,
                pm.message,
                pc.project_id

            FROM project_messages pm

            INNER JOIN project_chats pc
                ON pc.id = pm.chat_id

            WHERE pm.id = $1
            AND pc.project_id = $2
            `,
            [
                messageId,
                projectId
            ]
        );


    if (
        messageResult.rows.length === 0
    ) {

        throw new AppError(
            "Message not found",
            404
        );

    }


    const existingMessage =
        messageResult.rows[0];


    // --------------------------------------
    // Only sender can edit
    // --------------------------------------

    if (
        existingMessage.sender_id !== userId
    ) {

        throw new AppError(
            "You can only edit your own messages",
            403
        );

    }


    // --------------------------------------
    // Update message
    // --------------------------------------

    const result = await pool.query(
        `
        UPDATE project_messages

        SET
            message = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING
            id,
            chat_id,
            sender_id,
            message,
            created_at,
            updated_at
        `,
        [
            trimmedMessage,
            messageId
        ]
    );


    // --------------------------------------
    // Get sender
    // --------------------------------------

    const senderResult =
        await pool.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

    const updatedMessage = {

        ...result.rows[0],

        sender_name:
            senderResult.rows[0].name,

        sender_email:
            senderResult.rows[0].email

    };

        io.to(
    `project-${projectId}`
).emit(
    "project-message-updated",
    updatedMessage
);


    return updatedMessage;

};

// ==========================================
// DELETE MESSAGE
// ==========================================

export const deleteMessage = async (
    projectId,
    messageId,
    userId
) => {

    // --------------------------------------
    // Check project access
    // --------------------------------------

    const access =
        await checkProjectAccess(
            projectId,
            userId
        );


    // --------------------------------------
    // Get message
    // --------------------------------------

    const messageResult =
        await pool.query(
            `
            SELECT
                pm.id,
                pm.chat_id,
                pm.sender_id,
                pm.message,
                pc.project_id

            FROM project_messages pm

            INNER JOIN project_chats pc
                ON pc.id = pm.chat_id

            WHERE pm.id = $1
            AND pc.project_id = $2
            `,
            [
                messageId,
                projectId
            ]
        );


    if (
        messageResult.rows.length === 0
    ) {

        throw new AppError(
            "Message not found",
            404
        );

    }


    const existingMessage =
        messageResult.rows[0];


    // --------------------------------------
    // Determine permissions
    // --------------------------------------

    const role =
        access.role;


    const isSender =
        existingMessage.sender_id === userId;


    const canModerate =
        role === "Owner" ||
        role === "Manager";


    if (
        !isSender &&
        !canModerate
    ) {

        throw new AppError(
            "You do not have permission to delete this message",
            403
        );

    }


    // --------------------------------------
    // Delete message
    // --------------------------------------

    const result =
        await pool.query(
            `
            DELETE FROM project_messages

            WHERE id = $1

            RETURNING
                id,
                chat_id,
                sender_id,
                message,
                created_at,
                updated_at
            `,
            [messageId]
        );
    
    io.to(
    `project-${projectId}`
).emit(
    "project-message-deleted",
    {
        messageId
    }
);


    return result.rows[0];

};