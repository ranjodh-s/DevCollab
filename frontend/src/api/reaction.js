import api from "./axios";

export const createReaction = (data) =>
    api.post("/reactions", data);

export const deleteReactionByMessage = (messageId) =>
    api.delete(`/reactions/${messageId}`);

export const getReactionsByMessage = (messageId) =>
    api.get(`/reactions/message/${messageId}`);