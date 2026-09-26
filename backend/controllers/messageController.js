import {
    createMessageService,
    getTeamMessagesService,
    updateMessageService,
    createReplyService,
    getRepliesService,
    deleteMessageService
} from "../services/messageService.js";

export const createMessage = async (
    req,
    res,
    next
) => {

    try {

        const {
            teamId,
            message
        } = req.body;

        if (!teamId || !message) {

            return res.status(400).json({
                success: false,
                message:
                    "Team ID and message are required"
            });

        }

        const newMessage =
            await createMessageService(
                teamId,
                req.user.id,
                message
            );

        res.status(201).json({
            success: true,
            message: newMessage
        });

    } catch (err) {

        next(err);

    }

};

export const getTeamMessages = async (
    req,
    res,
    next
) => {

    try {

        const { teamId } = req.params;

        const messages =
            await getTeamMessagesService(
                teamId,
                req.user.id
            );

        res.status(200).json({

            success: true,

            messages

        });

    }

    catch(err){

        next(err);

    }

};

export const updateMessage = async (
    req,
    res,
    next
) => {

    try {

        const { messageId } = req.params;

        const { message } = req.body;

        if (!message?.trim()) {

            return res.status(400).json({

                success:false,

                message:"Message cannot be empty"

            });

        }

        const updatedMessage =
            await updateMessageService(

                messageId,

                req.user.id,

                message.trim()

            );

        res.status(200).json({

            success:true,

            message:updatedMessage

        });

    }

    catch(err){

        next(err);

    }

};

export const createReply = async (
    req,
    res,
    next
) => {

    try{

        const {
            parentMessageId,
            message
        } = req.body;

        if(!parentMessageId || !message){

            throw new AppError(
                "Parent message and reply are required.",
                400
            );

        }

        const reply =
        await createReplyService(
            parentMessageId,
            req.user.id,
            message
        );

        res.status(201).json({

            success:true,

            reply

        });

    }
    catch(err){

        next(err);

    }

};

export const getReplies = async (
    req,
    res,
    next
)=>{

    try{

        const { messageId } = req.params;

        const replies =
        await getRepliesService(
            messageId,
            req.user.id
        );

        res.status(200).json({

            success:true,

            replies

        });

    }
    catch(err){

        next(err);

    }

};

export const deleteMessage = async (
    req,
    res,
    next
) => {

    try {

        const { messageId } = req.params;

        const deletedMessage =
            await deleteMessageService(
                messageId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Message deleted successfully.",
            deletedMessage
        });

    } catch (err) {

        next(err);

    }

};