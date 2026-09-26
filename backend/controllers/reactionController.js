import {
    createOrUpdateReactionService,
    deleteReactionService,
    getMessageReactionsService
} from "../services/reactionService.js";

export const createOrUpdateReaction = async (
    req,
    res,
    next
) => {

    try {

        const {
            messageId,
            reaction
        } = req.body;

        if (!messageId || !reaction) {
            throw new AppError(
                "Message ID and reaction are required.",
                400
            );
        }

        const reactions =
            await createOrUpdateReactionService(
                messageId,
                req.user.id,
                reaction
            );

        res.status(200).json({
            success: true,
            reactions
        });

    }
    catch (err) {

        next(err);

    }

};

export const deleteReaction = async (
    req,
    res,
    next
) => {

    try {

        const { messageId } = req.params;

        const reactions =
            await deleteReactionService(
                messageId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            reactions
        });

    }
    catch (err) {

        next(err);

    }

};

export const getMessageReactions = async (
    req,
    res,
    next
) => {

    try {

        const { messageId } = req.params;

        const reactions =
            await getMessageReactionsService(
                messageId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            reactions
        });

    }
    catch (err) {

        next(err);

    }

};