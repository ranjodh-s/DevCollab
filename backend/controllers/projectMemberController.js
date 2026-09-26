import {
    getProjectMembersService,
    addProjectMemberService,
    updateProjectMemberRoleService,
    leaveProjectService,
    removeProjectMemberService
} from "../services/projectMemberService.js";


// =====================================================
// GET PROJECT MEMBERS
// =====================================================

export const getProjectMembers = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } = req.params;

        const data =
            await getProjectMembersService(
                projectId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// ADD PROJECT MEMBER
// =====================================================

export const addProjectMember = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            userId
        } = req.params;


        const data =
            await addProjectMemberService(
                projectId,
                userId,
                req.user.id
            );


        res.status(201).json({
            success: true,
            message: "Project member added successfully",
            data
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// UPDATE PROJECT MEMBER ROLE
// =====================================================

export const updateProjectMemberRole = async (
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

            return res.status(400).json({
                success: false,
                message: "Role is required"
            });

        }


        const member =
            await updateProjectMemberRoleService(
                projectId,
                userId,
                role,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message: "Project member role updated successfully",
            member
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// LEAVE PROJECT
// =====================================================

export const leaveProject = async (
    req,
    res,
    next
) => {

    try {

        const { projectId } = req.params;


        const member =
            await leaveProjectService(
                projectId,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message: "Left project successfully",
            member
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// REMOVE PROJECT MEMBER
// =====================================================

export const removeProjectMember = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId,
            userId
        } = req.params;


        const member =
            await removeProjectMemberService(
                projectId,
                userId,
                req.user.id
            );


        res.status(200).json({
            success: true,
            message: "Project member removed successfully",
            member
        });

    } catch (err) {

        next(err);

    }

};