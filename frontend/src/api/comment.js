import api from "./axios";

export const createComment = (data) =>
    api.post("/comments", data);

export const getComments = (taskId) =>
    api.get(`/comments/task/${taskId}`);

export const updateComment = (commentId, data) =>
    api.put(`/comments/${commentId}`, data);

export const deleteComment = (commentId) =>
    api.delete(`/comments/${commentId}`);