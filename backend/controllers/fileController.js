import {
    saveFile,
    getProjectFiles as getProjectFilesService,
    getFileById as getFileByIdService,
    deleteFile as deleteFileService,
    getTaskFiles as getTaskFilesService
} from "../services/fileService.js";


// ==========================================
// UPLOAD FILE
// ==========================================

export const uploadFile = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            taskId
        } = req.body;

        console.log(req.file)


        const file =
            await saveFile({

                file: req.file,

                uploadedBy: req.user.id,

                projectId,

                taskId

            });


        return res.status(201).json({

            success: true,

            message:
                "File uploaded successfully",

            data: {
                file
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// GET PROJECT FILES
// ==========================================

export const getProjectFiles = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;


        const result =
            await getProjectFilesService(
                projectId,
                req.user.id
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
// GET FILE BY ID
// ==========================================

export const getFileById = async (
    req,
    res,
    next
) => {

    try {

        const { fileId } =
            req.params;


        const file =
            await getFileByIdService(
                fileId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: {
                file
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// DELETE FILE
// ==========================================

export const deleteFile = async (
    req,
    res,
    next
) => {

    try {

        const { fileId } =
            req.params;


        const file =
            await deleteFileService(
                fileId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "File deleted successfully",

            data: {
                file: {
                    id: file.id,
                    original_name:
                        file.original_name,
                    project_id:
                        file.project_id
                }
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// GET TASK FILES
// ==========================================

export const getTaskFiles = async (
    req,
    res,
    next
) => {

    try {

        const { taskId } =
            req.params;


        const result =
            await getTaskFilesService(
                taskId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        next(error);

    }

};