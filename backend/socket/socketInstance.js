let io;

export const setIO = (socketIO) => {
    io = socketIO;
};

export const getIO = () => {
    return io;
};