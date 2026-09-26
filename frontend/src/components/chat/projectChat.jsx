import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    Send,
    Pencil,
    Trash2,
    Loader2,
    MessageCircle
} from "lucide-react";

import api from "../../api/axios";
import socket from "../../socket/socket.js";


export default function ProjectChat({
    projectId
}) {

    const [messages, setMessages] =
        useState([]);

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [loadingMore, setLoadingMore] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [page, setPage] =
        useState(1);

    const [hasNextPage, setHasNextPage] =
        useState(false);

    const [
        editingMessageId,
        setEditingMessageId
    ] = useState(null);

    const [
        editingText,
        setEditingText
    ] = useState("");


    const messagesContainerRef =
        useRef(null);


    // ==========================================
    // LOAD MESSAGES
    // ==========================================

    const fetchMessages = useCallback(
        async (
            pageNumber = 1,
            append = false
        ) => {

            if (!projectId) {
                return;
            }


            try {

                if (append) {

                    setLoadingMore(true);

                } else {

                    setLoading(true);

                }


                setError(null);


                const response =
                    await api.get(
                        `/projects/${projectId}/chat/messages`,
                        {
                            params: {
                                page: pageNumber,
                                limit: 20
                            }
                        }
                    );


                const data =
                    response.data.data;


                /*
                 * Backend returns newest first.
                 * Chat UI displays oldest → newest.
                 */

                const newMessages =
                    [...data.messages].reverse();


                if (append) {

                    setMessages(
                        (prev) => [
                            ...newMessages,
                            ...prev
                        ]
                    );

                } else {

                    setMessages(
                        newMessages
                    );

                }


                setHasNextPage(
                    data.pagination.hasNextPage
                );


                setPage(
                    pageNumber
                );


            } catch (error) {

                console.error(
                    "Error loading messages:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to load messages"
                );


            } finally {

                setLoading(false);
                setLoadingMore(false);

            }

        },
        [projectId]
    );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!projectId) {
            return;
        }


        setMessages([]);
        setPage(1);
        setHasNextPage(false);


        fetchMessages(1);

    }, [
        projectId,
        fetchMessages
    ]);


    // ==========================================
    // NEW MESSAGE SOCKET LISTENER
    // ==========================================

    useEffect(() => {

        const handleNewMessage =
            (newMessage) => {

                console.log(
                    "📨 NEW PROJECT MESSAGE:",
                    newMessage
                );


                setMessages(
                    (prev) => {

                        /*
                         * Prevent duplicates.
                         */

                        const alreadyExists =
                            prev.some(
                                (msg) =>
                                    msg.id ===
                                    newMessage.id
                            );


                        if (alreadyExists) {
                            return prev;
                        }


                        return [
                            ...prev,
                            newMessage
                        ];

                    }
                );


                /*
                 * Scroll to bottom.
                 */

                setTimeout(() => {

                    const container =
                        messagesContainerRef.current;


                    if (container) {

                        container.scrollTop =
                            container.scrollHeight;

                    }

                }, 50);

            };


        socket.on(
            "new-project-message",
            handleNewMessage
        );


        return () => {

            socket.off(
                "new-project-message",
                handleNewMessage
            );

        };

    }, []);


    // ==========================================
    // MESSAGE UPDATED SOCKET LISTENER
    // ==========================================

    useEffect(() => {

        const handleMessageUpdated =
            (updatedMessage) => {

                console.log(
                    "✏️ PROJECT MESSAGE UPDATED:",
                    updatedMessage
                );


                setMessages(
                    (prev) =>
                        prev.map(
                            (msg) =>
                                msg.id ===
                                updatedMessage.id
                                    ? updatedMessage
                                    : msg
                        )
                );

            };


        socket.on(
            "project-message-updated",
            handleMessageUpdated
        );


        return () => {

            socket.off(
                "project-message-updated",
                handleMessageUpdated
            );

        };

    }, []);


    // ==========================================
    // MESSAGE DELETED SOCKET LISTENER
    // ==========================================

    useEffect(() => {

        const handleMessageDeleted =
            ({ messageId }) => {

                console.log(
                    "🗑️ PROJECT MESSAGE DELETED:",
                    messageId
                );


                setMessages(
                    (prev) =>
                        prev.filter(
                            (msg) =>
                                msg.id !==
                                messageId
                        )
                );

            };


        socket.on(
            "project-message-deleted",
            handleMessageDeleted
        );


        return () => {

            socket.off(
                "project-message-deleted",
                handleMessageDeleted
            );

        };

    }, []);


    // ==========================================
    // CONNECT + JOIN PROJECT
    // ==========================================

    useEffect(() => {

        if (!projectId) {
            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            console.error(
                "❌ No authentication token found"
            );

            setError(
                "Authentication token not found"
            );

            return;

        }


        const numericProjectId =
            Number(projectId);


        if (
            !Number.isInteger(
                numericProjectId
            ) ||
            numericProjectId <= 0
        ) {

            console.error(
                "❌ Invalid project ID:",
                projectId
            );

            setError(
                "Invalid project ID"
            );

            return;

        }


        // ======================================
        // SET AUTH BEFORE CONNECTING
        // ======================================

        socket.auth = {
            token
        };


        // ======================================
        // JOIN PROJECT
        // ======================================

        const joinProject = () => {

            console.log(
                "➡️ Joining project:",
                numericProjectId
            );


            console.log(
                "📤 EMITTING join-project",
                {
                    socketId: socket.id,
                    connected: socket.connected,
                    projectId: numericProjectId
                }
            );


            socket.emit(
                "join-project",
                numericProjectId,
                (response) => {

                    console.log(
                        "PROJECT JOIN RESPONSE:",
                        response
                    );


                    if (
                        !response?.success
                    ) {

                        console.error(
                            "❌ Failed to join project:",
                            response?.message
                        );


                        setError(
                            response?.message ||
                            "Failed to join project"
                        );

                    } else {

                        console.log(
                            `✅ Successfully joined project-${numericProjectId}`
                        );

                    }

                }
            );

        };


        // ======================================
        // HANDLE SOCKET CONNECT
        // ======================================

        const handleConnect = () => {

            console.log(
                "🟢 PROJECT CHAT SOCKET CONNECTED:",
                socket.id
            );


            joinProject();

        };


        // ======================================
        // HANDLE SOCKET ERROR
        // ======================================

        const handleConnectError = (
            error
        ) => {

            console.error(
                "❌ PROJECT CHAT SOCKET ERROR:",
                error
            );


            setError(
                "Unable to connect to real-time chat"
            );

        };


        // ======================================
        // REGISTER EVENTS
        // ======================================

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );


        // ======================================
        // CONNECT
        // ======================================

        if (socket.connected) {

            console.log(
                "🟢 Socket already connected:",
                socket.id
            );


            joinProject();

        } else {

            console.log(
                "🔌 Connecting project chat socket..."
            );


            socket.connect();

        }


        // ======================================
        // CLEANUP
        // ======================================

        return () => {

            socket.off(
                "connect",
                handleConnect
            );


            socket.off(
                "connect_error",
                handleConnectError
            );


            /*
             * Leave current project room.
             */

            if (socket.connected) {

                socket.emit(
                    "leave-project",
                    numericProjectId
                );


                console.log(
                    `👋 Left project-${numericProjectId}`
                );

            }

        };

    }, [projectId]);


    // ==========================================
    // LOAD OLDER MESSAGES
    // ==========================================

    const loadOlderMessages =
        async () => {

            if (
                loadingMore ||
                !hasNextPage
            ) {

                return;

            }


            const container =
                messagesContainerRef.current;


            const previousScrollHeight =
                container?.scrollHeight || 0;


            await fetchMessages(
                page + 1,
                true
            );


            setTimeout(() => {

                if (!container) {
                    return;
                }


                const newScrollHeight =
                    container.scrollHeight;


                container.scrollTop =
                    newScrollHeight -
                    previousScrollHeight;

            }, 50);

        };


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSendMessage =
        async (e) => {

            e.preventDefault();


            const trimmedMessage =
                message.trim();


            if (!trimmedMessage) {
                return;
            }


            if (!socket.connected) {

                setError(
                    "Chat is not connected. Please wait a moment and try again."
                );

                return;

            }


            try {

                setSending(true);
                setError(null);


                /*
                 * Send message to backend.
                 *
                 * Backend saves it and emits:
                 *
                 * "new-project-message"
                 *
                 * We DO NOT update messages here.
                 */

                await api.post(
                    `/projects/${projectId}/chat/messages`,
                    {
                        message:
                            trimmedMessage
                    }
                );


                setMessage("");


            } catch (error) {

                console.error(
                    "Error sending message:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to send message"
                );


            } finally {

                setSending(false);

            }

        };


    // ==========================================
    // EDIT MESSAGE
    // ==========================================

    const handleEditMessage =
        async (messageId) => {

            const trimmedText =
                editingText.trim();


            if (!trimmedText) {
                return;
            }


            try {

                setError(null);


                await api.patch(
                    `/projects/${projectId}/chat/messages/${messageId}`,
                    {
                        message:
                            trimmedText
                    }
                );


                /*
                 * Backend broadcasts the updated
                 * message through Socket.IO.
                 */


                setEditingMessageId(
                    null
                );

                setEditingText("");


            } catch (error) {

                console.error(
                    "Error editing message:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to edit message"
                );

            }

        };


    // ==========================================
    // DELETE MESSAGE
    // ==========================================

    const handleDeleteMessage =
        async (messageId) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this message?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setError(null);


                await api.delete(
                    `/projects/${projectId}/chat/messages/${messageId}`
                );


                /*
                 * Backend broadcasts deletion
                 * through Socket.IO.
                 */


            } catch (error) {

                console.error(
                    "Error deleting message:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to delete message"
                );

            }

        };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

                <Loader2
                    className="animate-spin text-slate-400"
                    size={28}
                />

            </div>

        );

    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">

                    <MessageCircle
                        size={20}
                        className="text-slate-600"
                    />

                </div>


                <div>

                    <h2 className="font-semibold text-slate-900">
                        Project Chat
                    </h2>

                    <p className="text-xs text-slate-500">
                        Project conversation
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">

                    {error}

                </div>

            )}


            {/* MESSAGES */}

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 py-4"
            >

                {/* LOAD OLDER */}

                {hasNextPage && (

                    <div className="mb-4 flex justify-center">

                        <button
                            onClick={
                                loadOlderMessages
                            }
                            disabled={
                                loadingMore
                            }
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >

                            {loadingMore
                                ? "Loading..."
                                : "Load older messages"}

                        </button>

                    </div>

                )}


                {messages.length === 0 ? (

                    <div className="flex h-full flex-col items-center justify-center text-center">

                        <MessageCircle
                            size={40}
                            className="mb-3 text-slate-300"
                        />

                        <p className="font-medium text-slate-600">
                            No messages yet
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Start the conversation.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {messages.map(
                            (msg) => (

                                <MessageItem
                                    key={msg.id}
                                    message={msg}

                                    editingMessageId={
                                        editingMessageId
                                    }

                                    editingText={
                                        editingText
                                    }

                                    setEditingText={
                                        setEditingText
                                    }

                                    setEditingMessageId={
                                        setEditingMessageId
                                    }

                                    onEdit={
                                        handleEditMessage
                                    }

                                    onDelete={
                                        handleDeleteMessage
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </div>


            {/* INPUT */}

            <form
                onSubmit={
                    handleSendMessage
                }
                className="border-t border-slate-200 p-4"
            >

                <div className="flex items-end gap-3">

                    <textarea
                        value={message}
                        onChange={(e) =>
                            setMessage(
                                e.target.value
                            )
                        }

                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                handleSendMessage(
                                    e
                                );

                            }

                        }}

                        placeholder="Write a message..."
                        rows={1}

                        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />


                    <button
                        type="submit"

                        disabled={
                            sending ||
                            !message.trim()
                        }

                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {sending ? (

                            <Loader2
                                size={18}
                                className="animate-spin"
                            />

                        ) : (

                            <Send size={18} />

                        )}

                    </button>

                </div>

            </form>

        </div>

    );

}


// ==========================================
// MESSAGE ITEM
// ==========================================

function MessageItem({
    message,
    editingMessageId,
    editingText,
    setEditingText,
    setEditingMessageId,
    onEdit,
    onDelete
}) {

    const currentUserId =
        Number(
            localStorage.getItem(
                "userId"
            )
        );


    const isOwnMessage =
        Number(
            message.sender_id
        ) === currentUserId;


    const isEditing =
        editingMessageId ===
        message.id;


    const formattedTime =
        new Date(
            message.created_at
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    return (

        <div
            className={`flex ${
                isOwnMessage
                    ? "justify-end"
                    : "justify-start"
            }`}
        >

            <div
                className="group relative max-w-[75%]"
            >

                {/* SENDER */}

                {!isOwnMessage && (

                    <p className="mb-1 ml-1 text-xs font-medium text-slate-500">

                        {message.sender_name}

                    </p>

                )}


                {/* MESSAGE */}

                <div
                    className={`rounded-2xl px-4 py-3 ${
                        isOwnMessage
                            ? "rounded-br-md bg-slate-900 text-white"
                            : "rounded-bl-md bg-slate-100 text-slate-800"
                    }`}
                >

                    {isEditing ? (

                        <div className="min-w-[220px]">

                            <textarea
                                value={
                                    editingText
                                }

                                onChange={(e) =>
                                    setEditingText(
                                        e.target.value
                                    )
                                }

                                rows={3}

                                className="w-full resize-none rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none"
                            />


                            <div className="mt-2 flex justify-end gap-2">

                                <button
                                    type="button"

                                    onClick={() => {

                                        setEditingMessageId(
                                            null
                                        );

                                        setEditingText(
                                            ""
                                        );

                                    }}

                                    className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"

                                    onClick={() =>
                                        onEdit(
                                            message.id
                                        )
                                    }

                                    className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    ) : (

                        <p className="whitespace-pre-wrap break-words text-sm">

                            {message.message}

                        </p>

                    )}

                </div>


                {/* BOTTOM ROW */}

                <div
                    className={`mt-1 flex items-center gap-2 ${
                        isOwnMessage
                            ? "justify-end"
                            : "justify-start"
                    }`}
                >

                    <span className="text-[10px] text-slate-400">

                        {formattedTime}

                    </span>


                    {/* ACTIONS */}

                    {isOwnMessage &&
                        !isEditing && (

                            <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">

                                <button
                                    type="button"

                                    onClick={() => {

                                        setEditingMessageId(
                                            message.id
                                        );

                                        setEditingText(
                                            message.message
                                        );

                                    }}

                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"

                                    title="Edit"
                                >

                                    <Pencil
                                        size={13}
                                    />

                                </button>


                                <button
                                    type="button"

                                    onClick={() =>
                                        onDelete(
                                            message.id
                                        )
                                    }

                                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"

                                    title="Delete"
                                >

                                    <Trash2
                                        size={13}
                                    />

                                </button>

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

}