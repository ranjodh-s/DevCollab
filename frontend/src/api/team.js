import api from "./axios";


// ======================================================
// GET MY TEAMS
// ======================================================

export const getMyTeams = async () => {

    const res = await api.get("/teams");

    return res.data;

};


// ======================================================
// CREATE TEAM
// ======================================================

export const createTeam = async (data) => {

    const res = await api.post(
        "/teams",
        data
    );

    return res.data;

};


// ======================================================
// GET TEAM MEMBERS
// ======================================================

export const getTeamMembers = async (teamId) => {

    const res = await api.get(
        `/teams/${teamId}/members`
    );

    return res.data;

};


// ======================================================
// ADD TEAM MEMBER
// ======================================================

export const addTeamMember = async (
    teamId,
    userId
) => {

    const res = await api.post(
        `/teams/${teamId}/add-member`,
        {
            userId: Number(userId)
        }
    );

    return res.data;

};


// ======================================================
// REMOVE TEAM MEMBER
// ======================================================

export const removeTeamMember = async (
    teamId,
    userId
) => {

    const res = await api.delete(
        `/teams/${teamId}/remove-member/${userId}`
    );

    return res.data;

};

// ======================================================
// MAKE MEMBER ADMIN
// ======================================================

export const makeMemberAdmin = async (
    teamId,
    userId
) => {

    const res = await api.patch(
        `/teams/${teamId}/make-admin`,
        {
            userId: Number(userId)
        }
    );

    return res.data;
};


// ======================================================
// REMOVE ADMIN ROLE
// ======================================================

export const removeAdminRole = async (
    teamId,
    userId
) => {

    const res = await api.patch(
        `/teams/${teamId}/remove-admin`,
        {
            userId: Number(userId)
        }
    );

    return res.data;
};