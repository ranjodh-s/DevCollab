import api from "./axios";

export const getProjectActivity = async (projectId) => {
    const res = await api.get(`/activity/project/${projectId}`);
    return res.data;
};
export const getTeamActivity = async (
    teamId
) => {
    const res = await api.get(
        `/activity/team/${teamId}`
    );

    return res.data;
};