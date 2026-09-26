import pool from "../config/db.js";

import { getIO } from "../socket/socketInstance.js";

import { getMessageById } from "../utils/message.js";

import { verifyTeamMember } from "../utils/authorization.js";

import {
    getReactionByUserAndMessage,
    getMessageReactions
} from "../utils/reaction.js";

export const createOrUpdateReactionService = async (
    messageId,
    userId,
    reaction
) => {

    const message =
        await getMessageById(messageId);

    await verifyTeamMember(
        message.team_id,
        userId
    );

    const existingReaction =
        await getReactionByUserAndMessage(
            messageId,
            userId
        );

    if (existingReaction) {

        await pool.query(
            `
            UPDATE message_reactions
            SET reaction=$1
            WHERE id=$2
            `,
            [
                reaction,
                existingReaction.id
            ]
        );

    } else {

        await pool.query(
            `
            INSERT INTO message_reactions
            (
                message_id,
                user_id,
                reaction
            )
            VALUES($1,$2,$3)
            `,
            [
                messageId,
                userId,
                reaction
            ]
        );

    }

    const reactions =
        await getMessageReactions(messageId);

    const io = getIO();

    io.to(`team-${message.team_id}`).emit(
        "message-reactions-updated",
        {
            messageId,
            reactions
        }
    );

    return reactions;

};

export const deleteReactionService = async (
    messageId,
    userId
) => {

    const message =
        await getMessageById(messageId);

    await verifyTeamMember(
        message.team_id,
        userId
    );

    await pool.query(
        `
        DELETE FROM message_reactions

        WHERE

        message_id=$1

        AND user_id=$2
        `,
        [
            messageId,
            userId
        ]
    );

    const reactions =
        await getMessageReactions(messageId);

    const io = getIO();

    io.to(`team-${message.team_id}`).emit(
        "message-reactions-updated",
        {
            messageId,
            reactions
        }
    );

    return reactions;

};

export const getMessageReactionsService = async (
    messageId,
    userId
) => {

    const message =
        await getMessageById(messageId);

    await verifyTeamMember(
        message.team_id,
        userId
    );

    return await getMessageReactions(
        messageId
    );

};