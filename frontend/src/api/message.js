import api from "./axios";

export const createMessage = (data) =>
    api.post("/messages", data);

export const getMessagesByTeam = (teamId) =>
    api.get(`/messages/team/${teamId}`);

export const updateMessageById = (messageId, data) =>
    api.put(`/messages/${messageId}`, data);

export const deleteMessageById = (messageId) =>
    api.delete(`/messages/${messageId}`);

export const createReply = (data) =>
    api.post("/messages/reply", data);

export const getRepliesByMessage = (messageId) =>
    api.get(`/messages/${messageId}/replies`);