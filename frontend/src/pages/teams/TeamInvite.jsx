import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";

import {
    getTeamInvitationByToken,
    createTeamJoinRequest
} from "../../api/teamInvite";


export default function TeamInvite() {

    const { token } = useParams();

    const navigate = useNavigate();

    const user = useAuthStore(
        state => state.user
    );


    // ======================================================
    // STATE
    // ======================================================

    const [invitation, setInvitation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [requesting, setRequesting] =
        useState(false);

    const [error, setError] =
        useState(null);


    // ======================================================
    // VALIDATE INVITATION
    // ======================================================

    useEffect(() => {

        const validateInvitation = async () => {

            if (!token) {

                setError(
                    "Invitation link is invalid."
                );

                setLoading(false);

                return;
            }


            try {

                setLoading(true);

                setError(null);


                const response =
                    await getTeamInvitationByToken(
                        token
                    );


                console.log(
                    "TEAM INVITATION RESPONSE:",
                    response
                );


                const invitationData =
                    response?.invitation ||
                    response?.data?.invitation ||
                    response?.data;


                if (!invitationData) {

                    throw new Error(
                        "Invitation information could not be found."
                    );

                }


                setInvitation(
                    invitationData
                );


            } catch (err) {

                console.error(
                    "VALIDATE INVITATION ERROR:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "This invitation link is invalid or has expired."
                );


            } finally {

                setLoading(false);

            }

        };


        validateInvitation();

    }, [token]);


    // ======================================================
    // LOGIN
    // ======================================================

    const handleLogin = () => {

        navigate(
            `/login?redirect=/invite/${token}`
        );

    };


    // ======================================================
    // SIGNUP
    // ======================================================

    const handleSignup = () => {

        navigate(
            `/signup?redirect=/invite/${token}`
        );

    };


    // ======================================================
    // REQUEST TO JOIN
    // ======================================================

    const handleRequestToJoin = async () => {

        if (!token) {
            return;
        }


        // --------------------------------
        // User must be logged in
        // --------------------------------

        if (!user) {

            handleLogin();

            return;

        }


        try {

            setRequesting(true);


            const response =
                await createTeamJoinRequest(
                    token
                );


            console.log(
                "JOIN REQUEST RESPONSE:",
                response
            );


            const request =
                response?.request ||
                response?.data?.request;


            toast.success(
                "Join request sent successfully!"
            );


            // --------------------------------
            // Show pending state
            // --------------------------------

            if (
                request?.status === "Pending"
            ) {

                setInvitation({
                    ...invitation,
                    request_status: "Pending"
                });

                return;

            }


        } catch (err) {

            console.error(
                "CREATE JOIN REQUEST ERROR:",
                err
            );


            const status =
                err?.response?.status;


            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to send join request.";


            toast.error(
                message
            );


            // --------------------------------
            // Already a member
            // --------------------------------

            if (status === 409) {

                if (
                    message
                        .toLowerCase()
                        .includes("already a member")
                ) {

                    const teamId =
                        invitation?.team_id;

                    if (teamId) {

                        navigate(
                            `/team/${teamId}`,
                            {
                                replace: true
                            }
                        );

                    }

                }

            }


        } finally {

            setRequesting(false);

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center w-full max-w-md">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-slate-500">
                        Validating invitation...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // INVALID INVITATION
    // ======================================================

    if (error || !invitation) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center w-full max-w-md">

                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">

                        <span className="text-2xl text-red-600">
                            !
                        </span>

                    </div>


                    <h1 className="text-2xl font-bold text-slate-900 mt-5">
                        Invalid Invitation
                    </h1>


                    <p className="text-slate-500 mt-2">
                        {error ||
                            "This invitation link is no longer valid."
                        }
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                        Go Home
                    </button>

                </div>

            </div>

        );

    }


    // ======================================================
    // REQUEST ALREADY SENT
    // ======================================================

    const requestPending =
        invitation?.request_status === "Pending";


    // ======================================================
    // INVITATION PAGE
    // ======================================================

    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md p-8">


                {/* ==================================================
                    LOGO / ICON
                ================================================== */}

                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">

                    <span className="text-3xl">
                        👥
                    </span>

                </div>


                {/* ==================================================
                    TITLE
                ================================================== */}

                <div className="text-center mt-6">

                    <p className="text-sm font-medium text-blue-600">
                        Workspace Invitation
                    </p>


                    <h1 className="text-2xl font-bold text-slate-900 mt-2">
                        You're invited to join
                    </h1>


                    <h2 className="text-xl font-semibold text-slate-800 mt-2">
                        {invitation.team_name}
                    </h2>


                    {invitation.team_description && (

                        <p className="text-sm text-slate-500 mt-3">
                            {invitation.team_description}
                        </p>

                    )}

                </div>


                {/* ==================================================
                    INVITATION EXPIRATION
                ================================================== */}

                {invitation.expires_at && (

                    <div className="mt-5 text-center">

                        <p className="text-xs text-slate-400">
                            Invitation expires on{" "}
                            {new Date(
                                invitation.expires_at
                            ).toLocaleString()}
                        </p>

                    </div>

                )}


                {/* ==================================================
                    LOGGED IN USER
                ================================================== */}

                {user ? (

                    <div className="mt-8">

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                            <p className="text-sm text-slate-500">
                                Requesting as
                            </p>


                            <p className="font-medium text-slate-900 mt-1">
                                {user.name ||
                                    user.email ||
                                    "Current user"
                                }
                            </p>

                        </div>


                        {requestPending ? (

                            <div className="w-full mt-5 px-5 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-center font-semibold">
                                Join Request Pending
                            </div>

                        ) : (

                            <button
                                type="button"
                                onClick={
                                    handleRequestToJoin
                                }
                                disabled={
                                    requesting
                                }
                                className="w-full mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {requesting
                                    ? "Sending Request..."
                                    : "Request to Join"
                                }

                            </button>

                        )}

                    </div>

                ) : (

                    /* ==================================================
                       USER NOT LOGGED IN
                    ================================================== */

                    <div className="mt-8">

                        <p className="text-center text-sm text-slate-500">
                            Sign in or create an account to request
                            access to this workspace.
                        </p>


                        <button
                            type="button"
                            onClick={
                                handleLogin
                            }
                            className="w-full mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Login to Request Access
                        </button>


                        <button
                            type="button"
                            onClick={
                                handleSignup
                            }
                            className="w-full mt-3 px-5 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                        >
                            Create Account
                        </button>

                    </div>

                )}

            </div>

        </div>

    );

}