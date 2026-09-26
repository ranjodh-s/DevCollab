import { io } from "socket.io-client";


const socket = io(
    "http://localhost:5000",
    {
        autoConnect: false,
        withCredentials: true
    }
);


// ==========================================
// CONNECT
// ==========================================

socket.on(
    "connect",
    () => {

        console.log(
            "🟢 SOCKET CONNECTED:",
            socket.id
        );

    }
);


// ==========================================
// CONNECTION ERROR
// ==========================================

socket.on(
    "connect_error",
    (error) => {

        console.error(
            "🔴 SOCKET CONNECTION ERROR:",
            error.message
        );

    }
);


// ==========================================
// DISCONNECT
// ==========================================

socket.on(
    "disconnect",
    (reason) => {

        console.log(
            "🟡 SOCKET DISCONNECTED:",
            reason
        );

    }
);


export default socket;