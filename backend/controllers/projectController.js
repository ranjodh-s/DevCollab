import {
    createProjectService,
    getProjectsByTeamService,
    updateProjectService,
    deleteProjectService,
    addProjectMemberService,
    removeProjectMemberService,
    getProjectMembersService,
    updateProjectMemberRoleService,
    leaveProjectService,
    getMyProjectChats
} from "../services/projectService.js";


// ======================================================
// CREATE PROJECT
// ======================================================

export const createProject = async (req, res, next) => {

    try {

        const {
            teamId,
            name,
            description
        } = req.body;


        if (!teamId || !name) {

            return res.status(400).json({

                success: false,

                message:
                    "Team ID and project name are required"

            });

        }


        const project =
            await createProjectService(
                teamId,
                name,
                description,
                req.user.id
            );


        res.status(201).json({

            success: true,

            message:
                "Project created successfully",

            project

        });

    } catch (err) {

        next(err);

    }

};


// ======================================================
// GET PROJECTS BY TEAM
// ======================================================

export const getProjectsByTeam = async (
    req,
    res,
    next
) => {

    try {

        const { teamId } =
            req.params;


        const projects =
            await getProjectsByTeamService(
                teamId,
                req.user.id
            );


        res.status(200).json({

            success: true,

            projects

        });

    } catch (err) {

        next(err);

    }

};


// ======================================================
// UPDATE PROJECT
// OWNER / ADMIN ONLY
// ======================================================

export const updateProject = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;

        const {
            name,
            description
        } = req.body;


        // --------------------------------
        // Validate project ID
        // --------------------------------

        if (!projectId) {

            return res.status(400).json({

                success: false,

                message:
                    "Project ID is required"

            });

        }


        // --------------------------------
        // Validate project name
        // --------------------------------

        if (!name || !name.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Project name is required"

            });

        }


        // --------------------------------
        // Update project
        // --------------------------------

        const project =
            await updateProjectService(
                Number(projectId),
                name,
                description,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Project updated successfully",

            project

        });

    } catch (err) {

        next(err);

    }

};


// ======================================================
// DELETE PROJECT
// ======================================================

export const deleteProject = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;


        if (!projectId) {

            return res.status(400).json({

                success: false,

                message:
                    "Project ID is required"

            });

        }


        const project =
            await deleteProjectService(
                Number(projectId),
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Project deleted successfully",

            project

        });

    } catch (err) {

        next(err);

    }

};

// ==========================================
// ADD PROJECT MEMBER
// ==========================================

export const addMember = async (
    req,
    res,
    next
) => {

    try {

        const { projectId, userId } =
            req.params;

        const result =
            await addProjectMemberService(
                projectId,
                userId,
                req.user.id
            );

        return res.status(201).json({

            success: true,

            message:
                "Project member added successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// REMOVE PROJECT MEMBER
// ==========================================

export const removeMember = async (
    req,
    res,
    next
) => {

    try {

        const { projectId, userId } =
            req.params;

        const member =
            await removeProjectMemberService(
                projectId,
                userId,
                req.user.id
            );

        return res.status(200).json({

            success: true,

            message:
                "Project member removed successfully",

            data: {
                member
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// GET PROJECT MEMBERS
// ==========================================

export const getMembers = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;

        const result =
            await getProjectMembersService(
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
// CHANGE PROJECT MEMBER ROLE
// ==========================================

export const updateMemberRole = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            userId
        } = req.params;

        const { role } = req.body;

        if (!role) {

            throw new AppError(
                "role is required",
                400
            );

        }

        const member =
            await updateProjectMemberRoleService(
                projectId,
                userId,
                role,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Project member role updated successfully",

            data: {
                member
            }

        });

    } catch (error) {

        next(error);

    }

};

// ==========================================
// LEAVE PROJECT
// ==========================================

export const leaveProject = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } =
            req.params;


        const member =
            await leaveProjectService(
                projectId,
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "You left the project successfully",

            data: {
                member
            }

        });

    } catch (error) {

        next(error);

    }

};

export const getMyProjectChatsController = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const projects = await getMyProjectChats(
            Number(teamId),
            req.user.id
        );

        res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        next(error);
    }
};