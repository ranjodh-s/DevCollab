import {
    getProjectChat as getProjectChatService,
    getProjectMessages as getProjectMessagesService,
    sendMessage as sendMessageService,
    editMessage as editMessageService,
    deleteMessage as deleteMessageService
} from "../services/chatService.js";


// ==========================================
// GET PROJECT CHAT
// ==========================================

export const getProjectChat = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;


        const chat =
            await getProjectChatService(
                projectId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: {
                chat
            }

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================
// GET PROJECT MESSAGES
// ==========================================

export const getProjectMessages = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;


        const {
            page = 1,
            limit = 20
        } = req.query;


        const result =
            await getProjectMessagesService(
                projectId,
                req.user.id,
                page,
                limit
            );


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;

        const { message } =
            req.body;


        const newMessage =
            await sendMessageService(
                projectId,
                req.user.id,
                message
            );


        return res.status(201).json({

            success: true,

            message:
                "Message sent successfully",

            data: {
                message: newMessage
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// EDIT MESSAGE
// ==========================================

export const editMessage = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            messageId
        } = req.params;


        const {
            message
        } = req.body;


        const updatedMessage =
            await editMessageService(
                projectId,
                messageId,
                req.user.id,
                message
            );


        return res.status(200).json({

            success: true,

            message:
                "Message updated successfully",

            data: {
                message: updatedMessage
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// DELETE MESSAGE
// ==========================================

export const deleteMessage = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            messageId
        } = req.params;


        const deletedMessage =
            await deleteMessageService(
                projectId,
                messageId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Message deleted successfully",

            data: {
                message: deletedMessage
            }

        });

    } catch (error) {

        next(error);

    }

};