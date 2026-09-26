import api from "./axios";


// ======================================================
// GET PROJECT MEMBERS
// ======================================================

export const getProjectMembers = async (projectId) => {
    const res = await api.get(
        `/projects/${projectId}/members`
    );

    return res.data;
};


// ======================================================
// ADD PROJECT MEMBER
// ======================================================

export const addProjectMember = async (
    projectId,
    userId
) => {

    const res = await api.post(
        `/projects/${projectId}/members/${userId}`
    );

    return res.data;
};


// ======================================================
// UPDATE PROJECT MEMBER ROLE
// ======================================================

export const updateProjectMemberRole = async (
    projectId,
    userId,
    role
) => {

    const res = await api.patch(
        `/projects/${projectId}/members/${userId}/role`,
        {
            role
        }
    );

    return res.data;
};


// ======================================================
// LEAVE PROJECT
// ======================================================

export const leaveProject = async (
    projectId
) => {

    const res = await api.delete(
        `/projects/${projectId}/members/me`
    );

    return res.data;
};


// ======================================================
// REMOVE PROJECT MEMBER
// ======================================================

export const removeProjectMember = async (
    projectId,
    userId
) => {

    const res = await api.delete(
        `/projects/${projectId}/members/${userId}`
    );

    return res.data;
};