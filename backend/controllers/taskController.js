import {
    createTaskService,
    getTasksByProjectService,
    updateTaskService,
    updateTaskStatusService,
    deleteTaskService,
    getTeamTasks
} from "../services/taskService.js";

export const createTask = async (req, res, next) => {
    try {
        console.log("Request body:", req.body);

        const {
            projectId,
            title,
            description,
            priority,
            assignedTo,
            dueDate
        } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({
                success: false,
                message: "Project ID and title are required"
            });
        }

        console.log("Creating task with data:", {
            projectId,
            title
        });

        const task = await createTaskService(
            projectId,
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            req.user.id
        );

        console.log("task created successfully.")

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (err) {
        next(err);
    }
};

export const getTasksByProject = async (req, res, next) => {
    try {

        const { projectId } = req.params;

        const tasks = await getTasksByProjectService(
            projectId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            tasks
        });

    } catch (err) {
        next(err);
    }
};

export const updateTaskStatus = async (req, res, next) => {

    try {

        const { taskId } = req.params;
        const { status } = req.body;

        const task = await updateTaskStatusService(
            taskId,
            status,
            req.user.id
        );

        res.json({
            success: true,
            message: "Task status updated successfully",
            task
        });

    } catch (err) {
        next(err);
    }

};

export const updateTask = async (req, res, next) => {

    try {

        const { taskId } = req.params;

        const {
            title,
            description,
            priority,
            status,
            assignedTo,
            dueDate
        } = req.body;

        console.log("UPDATE TASK REQUEST:", {
            taskId,
            title,
            description,
            priority,
            status,
            assignedTo,
            dueDate
        });

        const task = await updateTaskService(
            taskId,
            title,
            description,
            priority,
            status,
            assignedTo,
            dueDate,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (err) {

        next(err);

    }

};

export const deleteTask = async (req, res, next) => {

    try {

        const { taskId } = req.params;

        await deleteTaskService(
            taskId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    }
    catch (err) {

        next(err);

    }

};




// ======================================================
// GET ALL TASKS FOR TEAM
// ======================================================

export const getTeamTasksController = async (
    req,
    res,
    next
) => {

    try {

        const {
            teamId
        } = req.params;


        const tasks =
            await getTeamTasks(
                Number(teamId),
                req.user.id
            );


        res.status(200).json({
            success: true,
            tasks
        });


    } catch (error) {

        next(error);

    }

};