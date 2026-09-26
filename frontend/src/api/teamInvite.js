import api from "./axios";


// ======================================================
// CREATE TEAM INVITATION
// ======================================================

export const createTeamInvitation = async (
    teamId,
    expiresInDays = 7
) => {
    const res = await api.post(
        `/teams/${teamId}/invitations`,
        {
            expiresInDays
        }
    );

    return res.data;
};


// ======================================================
// GET TEAM INVITATIONS
// Owner + Admin
// ======================================================

export const getTeamInvitations = async (teamId) => {
    const res = await api.get(
        `/teams/${teamId}/invitations`
    );

    return res.data;
};


// ======================================================
// GET INVITATION BY TOKEN
// Public
// ======================================================

export const getTeamInvitationByToken = async (token) => {
    const res = await api.get(
        `/teams/invite/${token}`
    );

    return res.data;
};


// ======================================================
// DEACTIVATE INVITATION
// Owner + Admin
// ======================================================

export const deactivateTeamInvitation = async (
    teamId,
    invitationId
) => {
    const res = await api.delete(
        `/teams/${teamId}/invitations/${invitationId}`
    );

    return res.data;
};


// ======================================================
// CREATE JOIN REQUEST
// Authenticated user
// ======================================================

export const createTeamJoinRequest = async (token) => {
    const res = await api.post(
        `/teams/invite/${token}/join`
    );

    return res.data;
};


// ======================================================
// GET JOIN REQUESTS
// Owner + Admin
// ======================================================

export const getTeamJoinRequests = async (
    teamId,
    status
) => {
    const res = await api.get(
        `/teams/${teamId}/join-requests`,
        {
            params: status ? { status } : {}
        }
    );

    return res.data;
};


// ======================================================
// APPROVE JOIN REQUEST
// ======================================================

export const approveTeamJoinRequest = async (
    teamId,
    requestId
) => {
    const res = await api.patch(
        `/teams/${teamId}/join-requests/${requestId}/approve`
    );

    return res.data;
};


// ======================================================
// REJECT JOIN REQUEST
// ======================================================

export const rejectTeamJoinRequest = async (
    teamId,
    requestId
) => {
    const res = await api.patch(
        `/teams/${teamId}/join-requests/${requestId}/reject`
    );

    return res.data;
};