import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    getTeamJoinRequests,
    approveTeamJoinRequest,
    rejectTeamJoinRequest
} from "../../api/teamInvite";


export default function TeamJoinRequestsCard({ teamId }) {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);


    // ======================================================
    // LOAD JOIN REQUESTS
    // ======================================================

    const fetchRequests = async () => {

        try {

            setLoading(true);

            const response =
                await getTeamJoinRequests(
                    Number(teamId),
                    "Pending"
                );

            console.log(
                "JOIN REQUESTS RESPONSE:",
                response
            );

            const requestData =
                response?.requests ||
                response?.data?.requests ||
                response?.data ||
                response ||
                [];

            setRequests(
                Array.isArray(requestData)
                    ? requestData
                    : []
            );

        } catch (err) {

            console.error(
                "FETCH JOIN REQUESTS ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load join requests."
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        if (!teamId) {
            return;
        }

        fetchRequests();

    }, [teamId]);


    // ======================================================
    // APPROVE REQUEST
    // ======================================================

    const handleApprove = async (request) => {

        if (!request?.id) {
            return;
        }

        try {

            setActionLoading(request.id);

            await approveTeamJoinRequest(
                Number(teamId),
                Number(request.id)
            );

            toast.success(
                `${request.user_name || "User"} has been added to the workspace.`
            );

            await fetchRequests();

        } catch (err) {

            console.error(
                "APPROVE JOIN REQUEST ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to approve request."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ======================================================
    // REJECT REQUEST
    // ======================================================

    const handleReject = async (request) => {

        if (!request?.id) {
            return;
        }

        const confirmed =
            window.confirm(
                `Reject join request from ${request.user_name || "this user"}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(request.id);

            await rejectTeamJoinRequest(
                Number(teamId),
                Number(request.id)
            );

            toast.success(
                "Join request rejected."
            );

            await fetchRequests();

        } catch (err) {

            console.error(
                "REJECT JOIN REQUEST ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to reject request."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDateTime = (date) => {

        if (!date) {
            return "Unknown date";
        }

        const parsedDate =
            new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Unknown date";
        }

        return parsedDate.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-start justify-between gap-3">

                <div>

                    <h3 className="text-lg font-semibold text-slate-900">
                        Join Requests
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Review requests from people using your invitation link.
                    </p>

                </div>


                {!loading && requests.length > 0 && (

                    <span className="min-w-7 h-7 px-2 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">

                        {requests.length}

                    </span>

                )}

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="py-8 text-center">

                    <div className="w-7 h-7 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading requests...
                    </p>

                </div>

            )}


            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading && requests.length === 0 && (

                <div className="py-8 text-center">

                    <div className="w-11 h-11 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
                        ✓
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-700">
                        No pending requests
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        New join requests will appear here.
                    </p>

                </div>

            )}


            {/* ==================================================
                REQUEST LIST
            ================================================== */}

            {!loading && requests.length > 0 && (

                <div className="mt-5 space-y-3">

                    {requests.map((request) => {

                        const isProcessing =
                            actionLoading === request.id;


                        return (

                            <div
                                key={request.id}
                                className="border border-slate-200 rounded-xl p-4"
                            >

                                <div className="flex items-start gap-3">

                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">

                                        {(
                                            request.user_name ||
                                            request.user_email ||
                                            "U"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}

                                    </div>


                                    <div className="min-w-0 flex-1">

                                        <p className="font-medium text-slate-900 truncate">

                                            {request.user_name ||
                                                "Unknown User"}

                                        </p>

                                        <p className="text-sm text-slate-500 truncate">

                                            {request.user_email ||
                                                "No email available"}

                                        </p>

                                        <p className="text-xs text-slate-400 mt-2">

                                            Requested{" "}

                                            {formatDateTime(
                                                request.created_at
                                            )}

                                        </p>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex gap-2 mt-4">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleApprove(request)
                                        }
                                        disabled={isProcessing}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >

                                        {isProcessing
                                            ? "Processing..."
                                            : "Approve"}

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleReject(request)
                                        }
                                        disabled={isProcessing}
                                        className="flex-1 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >

                                        Reject

                                    </button>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}