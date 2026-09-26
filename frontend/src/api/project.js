import api from "./axios";

export const getProjectsByTeam = async (teamId) => {

    const res = await api.get(
        `/projects/team/${teamId}`
    );

    return res.data;

};

export const createProject = async (data) => {

    const res = await api.post(
        "/projects",
        data
    );

    return res.data;

};

export const updateProject = async (projectId, data) => {

    const res = await api.put(
        `/projects/${projectId}`,
        data
    );

    return res.data;

};

export const deleteProject = async (projectId) => {

    const res = await api.delete(
        `/projects/${projectId}`
    );

    return res.data;

};

export const getMyProjectChats = async (teamId) => {
    const response = await api.get(
        `/projects/team/${teamId}/chats`
    );

    return response.data;
};