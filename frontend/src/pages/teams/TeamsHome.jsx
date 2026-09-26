import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Plus,
    FolderKanban,
    Link as LinkIcon,
    ArrowRight
} from "lucide-react";

import useAuthStore from "../../store/authStore";

import CreateTeamModal from "../../components/teams/CreateTeamModal";

import {
    createTeam,
    getMyTeams
} from "../../api/team";

import {
    getTeamInvitationByToken,
    createTeamJoinRequest
} from "../../api/teamInvite";

import TeamsNavbar from "../../components/layout/TeamsNavbar";


export default function TeamsHome() {

    const navigate = useNavigate();

    const user = useAuthStore(
        state => state.user
    );


    // ======================================================
    // USER
    // ======================================================

    const firstName = user?.name
        ? user.name.charAt(0).toUpperCase() +
          user.name.slice(1)
        : "";


    // ======================================================
    // STATE
    // ======================================================

    const [showModal, setShowModal] =
        useState(false);

    const [teams, setTeams] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [inviteLink, setInviteLink] =
        useState("");

    const [requestingWorkspace, setRequestingWorkspace] =
        useState(false);


    // ======================================================
    // FETCH TEAMS
    // ======================================================

    const fetchTeams = async () => {

        try {

            setLoading(true);

            const response =
                await getMyTeams();

            setTeams(
                response?.teams ||
                response?.data?.teams ||
                response ||
                []
            );

        } catch (err) {

            console.error(
                "FETCH TEAMS ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to load teams"
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchTeams();

    }, []);


    // ======================================================
    // CREATE TEAM
    // ======================================================

    const handleCreateTeam = async (data) => {

        try {

            await createTeam(data);

            toast.success(
                "Team created successfully!"
            );

            setShowModal(false);

            await fetchTeams();

        } catch (err) {

            console.error(
                "CREATE TEAM ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to create team."
            );

        }

    };


    // ======================================================
    // EXTRACT INVITE TOKEN
    // ======================================================

    const extractInviteToken = (value) => {

        const trimmedValue =
            value.trim();

        if (!trimmedValue) {
            return null;
        }


        // --------------------------------
        // Full invite URL
        // --------------------------------

        try {

            const url =
                new URL(trimmedValue);

            const invitePrefix =
                "/invite/";

            if (
                !url.pathname.startsWith(
                    invitePrefix
                )
            ) {

                return null;

            }


            const token =
                url.pathname
                    .slice(invitePrefix.length)
                    .split("/")[0];


            return token || null;

        } catch {

            // --------------------------------
            // Also allow token directly
            // --------------------------------

            return trimmedValue;

        }

    };


    // ======================================================
    // REQUEST TO JOIN WORKSPACE
    // ======================================================

    const handleRequestToJoin = async () => {

        if (!inviteLink.trim()) {

            toast.error(
                "Please paste an invite link."
            );

            return;

        }


        const token =
            extractInviteToken(
                inviteLink
            );


        if (!token) {

            toast.error(
                "Please enter a valid workspace invite link."
            );

            return;

        }


        try {

            setRequestingWorkspace(true);


            // ==================================================
            // 1. VALIDATE INVITATION
            // ==================================================

            const inviteResponse =
                await getTeamInvitationByToken(
                    token
                );


            console.log(
                "TEAM INVITATION RESPONSE:",
                inviteResponse
            );


            const invitation =
                inviteResponse?.invitation ||
                inviteResponse?.data?.invitation ||
                inviteResponse?.data;


            if (!invitation?.team_id) {

                toast.error(
                    "This invitation link is invalid."
                );

                return;

            }


            // ==================================================
            // 2. CREATE JOIN REQUEST
            // ==================================================

            const requestResponse =
                await createTeamJoinRequest(
                    token
                );


            console.log(
                "JOIN REQUEST RESPONSE:",
                requestResponse
            );


            const request =
                requestResponse?.request ||
                requestResponse?.data?.request;


            // ==================================================
            // 3. SUCCESS
            // ==================================================

            if (
                request?.status === "Pending"
            ) {

                toast.success(
                    `Join request sent to ${invitation.team_name || "the workspace"}!`
                );

            } else {

                toast.success(
                    "Join request submitted successfully!"
                );

            }


            // Clear input
            setInviteLink("");


        } catch (err) {

            console.error(
                "REQUEST TO JOIN ERROR:",
                err
            );


            const status =
                err?.response?.status;


            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to send join request.";


            // ==================================================
            // ALREADY MEMBER
            // ==================================================

            if (
                status === 409 &&
                message
                    .toLowerCase()
                    .includes("already a member")
            ) {

                toast.error(
                    "You are already a member of this workspace."
                );


                // If backend returned team information
                // use it directly.
                const teamId =
                    err?.response?.data?.data?.team?.id ||
                    err?.response?.data?.team?.id;


                if (teamId) {

                    navigate(
                        `/team/${teamId}`
                    );

                    return;

                }


                // Otherwise open invitation page.
                navigate(
                    `/invite/${token}`
                );

                return;

            }


            // ==================================================
            // PENDING REQUEST
            // ==================================================

            if (
                status === 409 &&
                message
                    .toLowerCase()
                    .includes("pending")
            ) {

                toast.error(
                    "You already have a pending join request for this workspace."
                );

                return;

            }


            // ==================================================
            // OTHER ERROR
            // ==================================================

            toast.error(
                message
            );

        } finally {

            setRequestingWorkspace(
                false
            );

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h2 className="text-xl font-semibold">
                    Loading Teams...
                </h2>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <TeamsNavbar />


            <div className="max-w-6xl mx-auto px-10 py-12">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex justify-between items-center">

                    <div>

                        <p className="uppercase tracking-[0.3em] text-sm text-slate-500">
                            Your Workspaces
                        </p>


                        <h1 className="text-5xl font-bold mt-2">

                            Welcome back, {firstName} 👋

                        </h1>


                        <p className="mt-4 text-slate-500 text-lg">

                            Choose a workspace to continue collaborating.

                        </p>

                    </div>


                    {teams.length > 0 && (

                        <button
                            onClick={() =>
                                setShowModal(true)
                            }
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                        >

                            <Plus size={20} />

                            New Workspace

                        </button>

                    )}

                </div>


                {/* ==================================================
                    REQUEST TO JOIN WORKSPACE
                ================================================== */}

                <div className="mt-10 bg-white rounded-2xl shadow-md border border-slate-100 p-6">

                    <div className="flex items-start gap-4">


                        {/* ICON */}

                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">

                            <LinkIcon
                                size={24}
                                className="text-blue-600"
                            />

                        </div>


                        <div className="flex-1">


                            {/* TITLE */}

                            <h2 className="text-xl font-bold text-slate-800">

                                Join a Workspace

                            </h2>


                            <p className="text-slate-500 mt-1">

                                Have an invite link? Paste it below to request access to the workspace.

                            </p>


                            {/* INPUT + BUTTON */}

                            <div className="mt-5 flex flex-col sm:flex-row gap-3">


                                {/* INPUT */}

                                <div className="relative flex-1">

                                    <LinkIcon
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />


                                    <input
                                        type="text"
                                        value={inviteLink}
                                        onChange={(e) =>
                                            setInviteLink(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {

                                            if (
                                                e.key === "Enter" &&
                                                !requestingWorkspace
                                            ) {

                                                handleRequestToJoin();

                                            }

                                        }}
                                        placeholder="Paste workspace invite link"
                                        className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />

                                </div>


                                {/* BUTTON */}

                                <button
                                    onClick={
                                        handleRequestToJoin
                                    }
                                    disabled={
                                        requestingWorkspace ||
                                        !inviteLink.trim()
                                    }
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {requestingWorkspace
                                        ? "Sending Request..."
                                        : "Request to Join"
                                    }


                                    {!requestingWorkspace && (

                                        <ArrowRight
                                            size={18}
                                        />

                                    )}

                                </button>

                            </div>


                            {/* HELP TEXT */}

                            <p className="text-xs text-slate-400 mt-3">

                                Example: https://your-app.com/invite/your-invite-token

                            </p>


                            {/* APPROVAL INFO */}

                            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">

                                <p className="text-sm text-blue-700">

                                    Your request will be sent to the
                                    workspace Owner or Admin for approval.
                                    You will become a member only after
                                    your request is approved.

                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {teams.length === 0 && (

                    <div className="mt-16 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 h-[500px] flex flex-col items-center justify-center px-12">


                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">

                            <FolderKanban
                                size={52}
                                className="text-blue-600"
                            />

                        </div>


                        <h2 className="text-3xl font-bold mt-8">

                            Welcome to DevCollab 👋

                        </h2>


                        <p className="mt-5 text-slate-500 text-center max-w-xl leading-7">

                            Create your first workspace and invite your teammates
                            to collaborate on projects, manage tasks, and achieve
                            your goals together.

                        </p>


                        <button
                            onClick={() =>
                                setShowModal(true)
                            }
                            className="mt-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                        >

                            <Plus size={20} />

                            Create Workspace

                        </button>

                    </div>

                )}


                {/* ==================================================
                    WORKSPACE GRID
                ================================================== */}

                {teams.length > 0 && (

                    <>

                        <h2 className="text-2xl font-semibold mt-12 mb-6">

                            Your Workspaces ({teams.length})

                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {teams.map((team) => (

                                <div
                                    key={team.id}
                                    onClick={() =>
                                        navigate(
                                            `/team/${team.id}`
                                        )
                                    }
                                    className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                                >


                                    {/* TEAM ICON */}

                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">

                                        {team.name
                                            .charAt(0)
                                            .toUpperCase()
                                        }

                                    </div>


                                    {/* TEAM NAME */}

                                    <h3 className="mt-5 text-xl font-bold">

                                        {team.name}

                                    </h3>


                                    {/* TEAM INFO */}

                                    <div className="mt-5 space-y-2 text-sm text-slate-600">

                                        <p>

                                            👥 {team.memberCount} Member
                                            {team.memberCount !== 1
                                                ? "s"
                                                : ""
                                            }

                                        </p>


                                        <p>

                                            📁 {team.projectCount} Project
                                            {team.projectCount !== 1
                                                ? "s"
                                                : ""
                                            }

                                        </p>


                                        <p>

                                            👑 {team.role}

                                        </p>

                                    </div>


                                    {/* OPEN */}

                                    <div className="mt-8 flex justify-end">

                                        <span className="text-blue-600 font-semibold">

                                            Open Workspace →

                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </>

                )}

            </div>


            {/* ==================================================
                CREATE TEAM MODAL
            ================================================== */}

            <CreateTeamModal
                open={
                    showModal
                }
                onClose={() =>
                    setShowModal(false)
                }
                onCreate={
                    handleCreateTeam
                }
            />

        </div>

    );

}