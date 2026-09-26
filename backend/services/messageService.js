import pool from "../config/db.js";

import { getIO } from "../socket/socketInstance.js";

import { verifyTeamMember } from "../utils/authorization.js";

import {
    getMessageById,
    getMessageDetails
} from "../utils/message.js";



export const createMessageService = async (

    teamId,

    senderId,

    message

) => {

    await verifyTeamMember(
        teamId,
        senderId
    );

    const result = await pool.query(
        `
        INSERT INTO messages
        (
            team_id,
            sender_id,
            message
        )

        VALUES($1,$2,$3)

        RETURNING id
        `,
        [
            teamId,
            senderId,
            message
        ]
    );

    const message = getMessageDetails(
        result.rows[0].id
    );

    const io = getIO();

    io.to(`team-${teamId}`).emit(
        "new-message",
        message
    );

    return message;

};

const getMessageDetails = async (
    messageId
) => {

    const result = await pool.query(
        `
        SELECT

m.id,

m.team_id,

m.parent_message_id,

m.message,

m.created_at,

m.edited_at,

m.is_deleted,

u.id AS sender_id,

u.name AS sender_name,

u.email

FROM messages m

JOIN users u

ON m.sender_id=u.id

WHERE m.id=$1
        `,
        [messageId]
    );

    return result.rows[0];

};

export const getTeamMessagesService = async (

    teamId,

    userId

) => {

    await verifyTeamMember(
        teamId,
        userId
    );

    const result =
        await pool.query(

            `
        SELECT

            m.id,

            m.message,

            m.created_at,

            u.id AS sender_id,

            u.name AS sender_name,

            u.email

        FROM messages m

        JOIN users u

        ON m.sender_id=u.id

        WHERE m.team_id=$1

        ORDER BY m.created_at ASC
        `,

            [teamId]

        );

    return result.rows;

}

export const updateMessageService = async (

    messageId,

    userId,

    message

) => {

    const existingMessage =
        await getMessageById(
            messageId
        );

    await verifyTeamMember(

        existingMessage.team_id,

        userId

    );

    if (existingMessage.sender_id !== userId) {

        throw new AppError(

            "You can only edit your own messages",

            403

        );

    }

    const result =
        await pool.query(

            `
            UPDATE messages

            SET

            message=$1

            WHERE id=$2

            RETURNING id
            `,

            [
                message,

                messageId
            ]

        );

    const updatedMessage =
        await getMessageDetails(
            result.rows[0].id
        );

    const io = getIO();

    io.to(
        `team-${updatedMessage.team_id}`
    ).emit(

        "message-updated",

        updatedMessage

    );

}

export const deleteMessageService = async (

    messageId,

    userId

) => {

    const message =
        await getMessageById(messageId);

    await verifyTeamMember(
        message.team_id, userId
    );

    if (message.sender_id !== userId) {

        throw new AppError(

            "You can only delete your own messages",

            403

        );

    }

    const result =
        await pool.query(

            `
            UPDATE messages

            SET

            message='This message was deleted',

            is_deleted=TRUE

            WHERE id=$1

            RETURNING id;
            `,

            [
                messageId
            ]

        );

    const deletedMessage =
        await getMessageDetails(messageId);

    io.to(
        `team-${message.team_id}`
    ).emit(

        "message-deleted",

        deletedMessage

    );

}

export const createReplyService = async (

    parentMessageId,

    userId,

    message

)=>{

    const parentMessage =
    await getMessageById(
        parentMessageId
    );

    await verifyTeamMember(
        parentMessage.team_id,
        userId
    );

    const result =
    await pool.query(

        `
        INSERT INTO messages
        (
            team_id,
            sender_id,
            message,
            parent_message_id
        )

        VALUES($1,$2,$3,$4)

        RETURNING id
        `,

        [

            parentMessage.team_id,

            userId,

            message,

            parentMessageId

        ]

    );

    const reply =
    await getMessageDetails(
        result.rows[0].id
    );

    const io = getIO();

    io.to(
        `team-${parentMessage.team_id}`
    ).emit(
        "new-message",
        reply
    );

    return reply;

};

export const getRepliesService = async (

    messageId,

    userId

)=>{

    const parentMessage =
    await getMessageById(
        messageId
    );

    await verifyTeamMember(
        parentMessage.team_id,
        userId
    );

    const result =
    await pool.query(

        `
        SELECT

            m.id,

            m.message,

            m.created_at,

            m.edited_at,

            m.is_deleted,

            u.id AS sender_id,

            u.name AS sender_name,

            u.email

        FROM messages m

        JOIN users u

        ON m.sender_id=u.id

        WHERE
            m.parent_message_id=$1

        ORDER BY
            m.created_at ASC
        `,

        [messageId]

    );

    return result.rows;

};