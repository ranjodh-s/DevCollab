import {
    createCommentService,
    getCommentsByTaskService,
    updateCommentService,
    deleteCommentService
} from "../services/commentService.js";
import AppError from "../utils/AppError.js";


export const createComment = async (
    req,
    res,
    next
) => {

    try {

        const {
            taskId,
            comment
        } = req.body;

        if (!taskId || !comment) {
            throw new AppError(
                "Task ID and comment are required",
                400
            );
        }

        const newComment =
            await createCommentService(
                taskId,
                comment,
                req.user.id
            );

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: newComment
        });

    }
    catch(err){
        next(err);
    }

};

export const getCommentsByTask = async (
    req,
    res,
    next
) => {

    try{

        const { taskId } = req.params;

        const comments =
            await getCommentsByTaskService(
                taskId,
                req.user.id
            );

        res.status(200).json({
            success:true,
            comments
        });

    }
    catch(err){

        next(err);

    }

};

export const updateComment = async (
    req,
    res,
    next
)=>{

    try{

        const { commentId } = req.params;
        const { comment } = req.body;

        if(!comment){
            throw new AppError(
                "Comment is required",
                400
            );
        }

        const updatedComment =
            await updateCommentService(
                commentId,
                comment,
                req.user.id
            );

        res.status(200).json({
            success:true,
            message:"Comment updated successfully",
            comment:updatedComment
        });

    }
    catch(err){

        next(err);

    }

};

export const deleteComment = async (
    req,
    res,
    next
)=>{

    try{

        const { commentId } = req.params;

        await deleteCommentService(
            commentId,
            req.user.id
        );

        res.status(200).json({
            success:true,
            message:"Comment deleted successfully"
        });

    }
    catch(err){

        next(err);

    }

};