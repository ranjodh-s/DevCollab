// import api from "./axios";

// export const createTask = (data) =>
//     api.post("/tasks", data);

// export const getTasksByProject = (projectId) =>
//     api.get(`/tasks/project/${projectId}`);

// export const getTaskById = (taskId) =>
//     api.get(`/tasks/${taskId}`);

// export const updateTaskById = (taskId, data) =>
//     api.put(`/tasks/${taskId}`, data);

// export const updateTaskStatusById = (taskId, status) =>
//     api.patch(`/tasks/${taskId}/status`, { status });

// export const deleteTaskById = (taskId) =>
//     api.delete(`/tasks/${taskId}`);

// export const getTeamTasks = async (teamId) => {

//     const response = await api.get(
//         `/tasks/team/${teamId}`
//     );

//     return response.data;

// };

import api from "./axios";


// ======================================================
// CREATE TASK
// ======================================================

export const createTask = (data) =>
    api.post(
        "/tasks",
        data
    );


// ======================================================
// GET TASKS BY PROJECT
// ======================================================

export const getTasksByProject = (projectId) =>
    api.get(
        `/tasks/project/${projectId}`
    );


// ======================================================
// GET TASK BY ID
// ======================================================

export const getTaskById = (taskId) =>
    api.get(
        `/tasks/${taskId}`
    );


// ======================================================
// UPDATE TASK
// ======================================================

export const updateTaskById = (
    taskId,
    data
) =>
    api.put(
        `/tasks/${taskId}`,
        data
    );


// ======================================================
// UPDATE TASK STATUS
// ======================================================

export const updateTaskStatusById = (
    taskId,
    status
) =>
    api.patch(
        `/tasks/${taskId}/status`,
        {
            status
        }
    );


// ======================================================
// DELETE TASK
// ======================================================

export const deleteTaskById = (
    taskId
) =>
    api.delete(
        `/tasks/${taskId}`
    );


// ======================================================
// GET ALL TASKS FOR TEAM
// ======================================================

export const getTeamTasks = async (
    teamId
) => {

    const response =
        await api.get(
            `/tasks/team/${teamId}`
        );


    return response.data;

};