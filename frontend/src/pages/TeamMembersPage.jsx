import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    ShieldOff,
    Trash2,
    Copy,
    Check,
    Link,
    Clock,
    UserRound,
    UserCheck,
    UserX,
    ArrowLeft
} from "lucide-react";

import useAuthStore from "../store/authStore";

import {
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    makeMemberAdmin,
    removeAdminRole
} from "../api/team";

import {
    createTeamInvitation,
    getTeamInvitations,
    deactivateTeamInvitation,
    getTeamJoinRequests,
    approveTeamJoinRequest,
    rejectTeamJoinRequest
} from "../api/teamInvite";

import AddTeamMemberModal from "../components/teams/AddTeamMemberModal";
import ConfirmActionModal from "../components/common/ConfirmActionModal";


export default function TeamMembersPage() {

    const {
        teamId
    } = useParams();

    const navigate = useNavigate();

    const user = useAuthStore(
        state => state.user
    );


    // ======================================================
    // ACTIVE TAB
    // ======================================================

    const [activeTab, setActiveTab] =
        useState("members");


    // ======================================================
    // MEMBERS
    // ======================================================

    const [members, setMembers] =
        useState([]);

    const [loadingMembers, setLoadingMembers] =
        useState(true);

    const [showAddMemberModal, setShowAddMemberModal] =
        useState(false);

    const [addingMember, setAddingMember] =
        useState(false);


    // ======================================================
    // MEMBER ACTIONS
    // ======================================================

    const [updatingUserId, setUpdatingUserId] =
        useState(null);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const [confirmLoading, setConfirmLoading] =
        useState(false);


    // ======================================================
    // INVITATION
    // ======================================================

    const [invite, setInvite] =
        useState(null);

    const [loadingInvite, setLoadingInvite] =
        useState(false);

    const [creatingInvite, setCreatingInvite] =
        useState(false);

    const [revokingInvite, setRevokingInvite] =
        useState(false);

    const [expiresInDays, setExpiresInDays] =
        useState(7);

    const [copied, setCopied] =
        useState(false);


    // ======================================================
    // JOIN REQUESTS
    // ======================================================

    const [joinRequests, setJoinRequests] =
        useState([]);

    const [loadingRequests, setLoadingRequests] =
        useState(false);

    const [requestActionId, setRequestActionId] =
        useState(null);


    // ======================================================
    // CURRENT USER ROLE
    // ======================================================

    const currentUser =
        members.find(
            member =>
                String(
                    member.id ??
                    member.user_id
                ) === String(user?.id)
        );

    const currentUserRole =
        currentUser?.role || null;

    const canManage =
        currentUserRole === "Owner" ||
        currentUserRole === "Admin";


    // ======================================================
    // LOAD MEMBERS
    // ======================================================

    const fetchMembers = async () => {

        try {

            setLoadingMembers(true);

            const response =
                await getTeamMembers(
                    Number(teamId)
                );

            setMembers(
                response?.members ||
                response?.data?.members ||
                response?.data ||
                response ||
                []
            );

        } catch (err) {

            console.error(
                "FETCH MEMBERS ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to load team members."
            );

        } finally {

            setLoadingMembers(false);

        }

    };


    // ======================================================
    // LOAD INVITATION
    // ======================================================

    const fetchInvite = async () => {

        try {

            setLoadingInvite(true);

            const response =
                await getTeamInvitations(
                    Number(teamId)
                );

            const invitations =
                response?.invitations ||
                response?.data?.invitations ||
                response?.data ||
                [];

            const activeInvite =
                Array.isArray(invitations)
                    ? invitations.find(
                        item =>
                            item.is_active === true &&
                            new Date(item.expires_at) > new Date()
                    )
                    : null;

            setInvite(
                activeInvite || null
            );

        } catch (err) {

            console.error(
                "FETCH INVITE ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to load invitation."
            );

        } finally {

            setLoadingInvite(false);

        }

    };


    // ======================================================
    // LOAD JOIN REQUESTS
    // ======================================================

    const fetchJoinRequests = async () => {

        try {

            setLoadingRequests(true);

            const response =
                await getTeamJoinRequests(
                    Number(teamId),
                    "Pending"
                );

            setJoinRequests(
                response?.requests ||
                response?.data?.requests ||
                response?.data ||
                []
            );

        } catch (err) {

            console.error(
                "FETCH JOIN REQUESTS ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to load join requests."
            );

        } finally {

            setLoadingRequests(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        if (!teamId) {
            return;
        }

        fetchMembers();

    }, [teamId]);


    // ======================================================
    // LOAD TAB DATA
    // ======================================================

    useEffect(() => {

        if (!teamId || !canManage) {
            return;
        }

        if (activeTab === "invite") {
            fetchInvite();
        }

        if (activeTab === "requests") {
            fetchJoinRequests();
        }

    }, [
        teamId,
        activeTab,
        canManage
    ]);


    // ======================================================
    // ADD MEMBER
    // ======================================================

    const handleAddMember = async (
        userId
    ) => {

        try {

            setAddingMember(true);

            await addTeamMember(
                Number(teamId),
                Number(userId)
            );

            toast.success(
                "Member added successfully!"
            );

            setShowAddMemberModal(
                false
            );

            await fetchMembers();

        } catch (err) {

            console.error(
                "ADD MEMBER ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add member."
            );

        } finally {

            setAddingMember(false);

        }

    };


    // ======================================================
    // REMOVE MEMBER
    // ======================================================

    const handleRemoveMember = (
        member
    ) => {

        if (!member) {
            return;
        }

        const memberId =
            member.id ??
            member.user_id;

        if (!memberId) {

            toast.error(
                "Member ID is missing."
            );

            return;
        }

        if (
            String(memberId) ===
            String(user?.id)
        ) {

            toast.error(
                "You cannot remove yourself from the team."
            );

            return;
        }

        if (
            member.role === "Owner"
        ) {

            toast.error(
                "Team owner cannot be removed."
            );

            return;
        }

        setConfirmAction({
            type: "remove-member",
            member
        });

    };


    // ======================================================
    // MAKE ADMIN
    // ======================================================

    const handleMakeAdmin = (
        member
    ) => {

        if (!member) {
            return;
        }

        setConfirmAction({
            type: "make-admin",
            member
        });

    };


    // ======================================================
    // REMOVE ADMIN
    // ======================================================

    const handleRemoveAdmin = (
        member
    ) => {

        if (!member) {
            return;
        }

        if (
            member.role === "Owner"
        ) {

            toast.error(
                "Owner role cannot be removed."
            );

            return;
        }

        setConfirmAction({
            type: "remove-admin",
            member
        });

    };


    // ======================================================
    // CONFIRM MEMBER ACTION
    // ======================================================

    const handleConfirmAction = async () => {

        if (!confirmAction?.member) {
            return;
        }

        const member =
            confirmAction.member;

        const memberId =
            member.id ??
            member.user_id;

        try {

            setConfirmLoading(true);

            setUpdatingUserId(
                memberId
            );


            // ----------------------------------------------
            // MAKE ADMIN
            // ----------------------------------------------

            if (
                confirmAction.type ===
                "make-admin"
            ) {

                await makeMemberAdmin(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    `${member.name || "Member"} is now an Admin.`
                );

            }


            // ----------------------------------------------
            // REMOVE ADMIN
            // ----------------------------------------------

            if (
                confirmAction.type ===
                "remove-admin"
            ) {

                await removeAdminRole(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    "Admin role removed."
                );

            }


            // ----------------------------------------------
            // REMOVE MEMBER
            // ----------------------------------------------

            if (
                confirmAction.type ===
                "remove-member"
            ) {

                await removeTeamMember(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    "Member removed successfully."
                );

            }

            setConfirmAction(
                null
            );

            await fetchMembers();

        } catch (err) {

            console.error(
                "MEMBER ACTION ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Action failed."
            );

        } finally {

            setConfirmLoading(false);

            setUpdatingUserId(
                null
            );

        }

    };


    // ======================================================
    // CREATE INVITATION
    // ======================================================

    const handleCreateInvite = async () => {

        try {

            setCreatingInvite(true);

            const response =
                await createTeamInvitation(
                    Number(teamId),
                    Number(expiresInDays)
                );

            const createdInvite =
                response?.invitation ||
                response?.data?.invitation ||
                response?.data;

            if (createdInvite) {

                setInvite(
                    createdInvite
                );

            }

            toast.success(
                "Workspace invitation ready."
            );

            await fetchInvite();

        } catch (err) {

            console.error(
                "CREATE INVITE ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create invitation."
            );

        } finally {

            setCreatingInvite(false);

        }

    };


    // ======================================================
    // COPY INVITE
    // ======================================================

    const handleCopyInvite = async () => {

        if (!invite?.token) {
            return;
        }

        const inviteUrl =
            `${window.location.origin}/invite/${invite.token}`;

        try {

            await navigator.clipboard.writeText(
                inviteUrl
            );

            setCopied(true);

            toast.success(
                "Invitation link copied."
            );

            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (err) {

            console.error(
                "COPY INVITE ERROR:",
                err
            );

            toast.error(
                "Failed to copy invitation link."
            );

        }

    };


    // ======================================================
    // DEACTIVATE INVITATION
    // ======================================================

    const handleDeactivateInvite = async () => {

        if (!invite?.id) {
            return;
        }

        try {

            setRevokingInvite(true);

            await deactivateTeamInvitation(
                Number(teamId),
                Number(invite.id)
            );

            toast.success(
                "Invitation deactivated."
            );

            setInvite(
                null
            );

        } catch (err) {

            console.error(
                "DEACTIVATE INVITE ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to deactivate invitation."
            );

        } finally {

            setRevokingInvite(false);

        }

    };


    // ======================================================
    // APPROVE REQUEST
    // ======================================================

    const handleApproveRequest = async (
        request
    ) => {

        if (!request?.id) {
            return;
        }

        try {

            setRequestActionId(
                request.id
            );

            await approveTeamJoinRequest(
                Number(teamId),
                Number(request.id)
            );

            toast.success(
                `${request.user_name || "User"} approved.`
            );

            await fetchJoinRequests();
            await fetchMembers();

        } catch (err) {

            console.error(
                "APPROVE REQUEST ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to approve request."
            );

        } finally {

            setRequestActionId(
                null
            );

        }

    };


    // ======================================================
    // REJECT REQUEST
    // ======================================================

    const handleRejectRequest = async (
        request
    ) => {

        if (!request?.id) {
            return;
        }

        try {

            setRequestActionId(
                request.id
            );

            await rejectTeamJoinRequest(
                Number(teamId),
                Number(request.id)
            );

            toast.success(
                "Join request rejected."
            );

            await fetchJoinRequests();

        } catch (err) {

            console.error(
                "REJECT REQUEST ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to reject request."
            );

        } finally {

            setRequestActionId(
                null
            );

        }

    };


    // ======================================================
    // DATE FORMATTER
    // ======================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ======================================================
    // ROLE BADGE
    // ======================================================

    const roleBadge = (
        role
    ) => {

        if (role === "Owner") {

            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    <ShieldCheck size={13} />
                    Owner
                </span>
            );

        }

        if (role === "Admin") {

            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <Shield size={13} />
                    Admin
                </span>
            );

        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <UserRound size={13} />
                Member
            </span>
        );

    };


    // ======================================================
    // NOT AUTHORIZED
    // ======================================================

    if (
        !loadingMembers &&
        members.length > 0 &&
        !canManage
    ) {

        return (
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

                <div className="max-w-6xl mx-auto">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/team/${teamId}`
                            )
                        }
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-5"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">

                        <Shield
                            size={42}
                            className="mx-auto text-slate-300 mb-3"
                        />

                        <h2 className="text-lg font-bold text-slate-900">
                            Workspace Members
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            You don't have permission to manage workspace members.
                        </p>

                    </div>

                </div>

            </div>
        );

    }


    return (

        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

            <div className="max-w-6xl mx-auto">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/team/${teamId}`
                                )
                            }
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-3"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users
                                    size={22}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-slate-900">
                                    Workspace Members
                                </h1>

                                <p className="text-sm text-slate-500 mt-0.5">
                                    Manage members, invitations and join requests
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    TABS
                ================================================== */}

                <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 shadow-sm">

                    <div className="flex flex-col sm:flex-row gap-1">

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("members")
                            }
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                activeTab === "members"
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Users size={17} />
                            Members
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("requests")
                            }
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                activeTab === "requests"
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <UserCheck size={17} />
                            Join Requests

                            {joinRequests.length > 0 && (
                                <span
                                    className={`min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] ${
                                        activeTab === "requests"
                                            ? "bg-white text-blue-600"
                                            : "bg-blue-100 text-blue-700"
                                    }`}
                                >
                                    {joinRequests.length}
                                </span>
                            )}

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("invite")
                            }
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                activeTab === "invite"
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Link size={17} />
                            Workspace Invite
                        </button>

                    </div>

                </div>


                {/* ==================================================
                    MEMBERS TAB
                ================================================== */}

                {activeTab === "members" && (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div>

                                <h2 className="font-bold text-slate-900">
                                    All Members
                                </h2>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    {members.length} member
                                    {members.length !== 1 ? "s" : ""}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddMemberModal(true)
                                }
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                            >
                                <UserPlus size={17} />
                                Add Member
                            </button>

                        </div>


                        {loadingMembers ? (

                            <div className="p-10 text-center text-sm text-slate-400">
                                Loading members...
                            </div>

                        ) : members.length === 0 ? (

                            <div className="p-10 text-center">

                                <Users
                                    size={40}
                                    className="mx-auto text-slate-300 mb-3"
                                />

                                <p className="text-sm text-slate-500">
                                    No members found.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {members.map(
                                    member => {

                                        const memberId =
                                            member.id ??
                                            member.user_id;

                                        const isCurrentUser =
                                            String(memberId) ===
                                            String(user?.id);

                                        const isOwner =
                                            member.role === "Owner";

                                        const isUpdating =
                                            String(
                                                updatingUserId
                                            ) ===
                                            String(memberId);

                                        return (

                                            <div
                                                key={memberId}
                                                className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                                            >

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">

                                                        <UserRound
                                                            size={18}
                                                            className="text-slate-500"
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <p className="font-semibold text-slate-900 truncate">
                                                                {member.name || "Unnamed User"}
                                                            </p>

                                                            {isCurrentUser && (
                                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                                    You
                                                                </span>
                                                            )}

                                                        </div>

                                                        <p className="text-xs text-slate-400 truncate mt-0.5">
                                                            {member.email || "No email"}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                                                    {roleBadge(
                                                        member.role
                                                    )}


                                                    {canManage &&
                                                        !isOwner &&
                                                        !isCurrentUser && (

                                                            <div className="flex items-center gap-2">

                                                                {member.role === "Admin" ? (

                                                                    <button
                                                                        type="button"
                                                                        disabled={isUpdating}
                                                                        onClick={() =>
                                                                            handleRemoveAdmin(
                                                                                member
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
                                                                    >
                                                                        <ShieldOff size={14} />
                                                                        Remove Admin
                                                                    </button>

                                                                ) : (

                                                                    <button
                                                                        type="button"
                                                                        disabled={isUpdating}
                                                                        onClick={() =>
                                                                            handleMakeAdmin(
                                                                                member
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                                                                    >
                                                                        <ShieldCheck size={14} />
                                                                        Make Admin
                                                                    </button>

                                                                )}


                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() =>
                                                                        handleRemoveMember(
                                                                            member
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Remove
                                                                </button>

                                                            </div>

                                                        )}

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                )}


                {/* ==================================================
                    JOIN REQUESTS TAB
                ================================================== */}

                {activeTab === "requests" && (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-5 py-4 border-b border-slate-100">

                            <h2 className="font-bold text-slate-900">
                                Join Requests
                            </h2>

                            <p className="text-xs text-slate-400 mt-0.5">
                                Review users requesting access to this workspace
                            </p>

                        </div>


                        {loadingRequests ? (

                            <div className="p-10 text-center text-sm text-slate-400">
                                Loading requests...
                            </div>

                        ) : joinRequests.length === 0 ? (

                            <div className="p-10 text-center">

                                <UserCheck
                                    size={40}
                                    className="mx-auto text-slate-300 mb-3"
                                />

                                <p className="font-medium text-slate-700">
                                    No pending requests
                                </p>

                                <p className="text-sm text-slate-400 mt-1">
                                    New workspace join requests will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {joinRequests.map(
                                    request => {

                                        const isProcessing =
                                            requestActionId ===
                                            request.id;

                                        return (

                                            <div
                                                key={request.id}
                                                className="px-5 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                                            >

                                                <div className="flex items-start gap-3 min-w-0">

                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">

                                                        <UserRound
                                                            size={18}
                                                            className="text-blue-600"
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="font-semibold text-slate-900">
                                                            {request.user_name || "Unknown User"}
                                                        </p>

                                                        <p className="text-sm text-slate-500 mt-0.5">
                                                            {request.user_email || "No email"}
                                                        </p>

                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">

                                                            <Clock
                                                                size={13}
                                                            />

                                                            Requested{" "}
                                                            {formatDate(
                                                                request.created_at
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="flex items-center gap-2">

                                                    <button
                                                        type="button"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleRejectRequest(
                                                                request
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        <UserX size={15} />
                                                        Reject
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleApproveRequest(
                                                                request
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <UserCheck size={15} />
                                                        Approve
                                                    </button>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                )}


                {/* ==================================================
                    INVITE TAB
                ================================================== */}

                {activeTab === "invite" && (

                    <div className="space-y-5">


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            <div className="px-5 py-4 border-b border-slate-100">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                                        <Link
                                            size={20}
                                            className="text-blue-600"
                                        />

                                    </div>

                                    <div>

                                        <h2 className="font-bold text-slate-900">
                                            Workspace Invitation
                                        </h2>

                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Generate a link that users can use to request access
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5">


                                {/* ACTIVE INVITE */}

                                {loadingInvite ? (

                                    <div className="py-8 text-center text-sm text-slate-400">
                                        Loading invitation...
                                    </div>

                                ) : invite ? (

                                    <div className="space-y-5">

                                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                                            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">

                                                <Check size={17} />

                                                Active invitation link

                                            </div>

                                            <p className="text-xs text-green-600 mt-1">
                                                Share this link with people you want to invite to the workspace.
                                            </p>

                                        </div>


                                        <div>

                                            <label className="block text-xs font-semibold text-slate-600 mb-2">
                                                Invitation Link
                                            </label>

                                            <div className="flex flex-col sm:flex-row gap-2">

                                                <div className="flex-1 min-w-0 px-3.5 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 truncate">
                                                    {`${window.location.origin}/invite/${invite.token}`}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCopyInvite
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check size={16} />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={16} />
                                                            Copy Link
                                                        </>
                                                    )}
                                                </button>

                                            </div>

                                        </div>


                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">

                                            <div className="flex items-center gap-2 text-xs text-slate-500">

                                                <Clock size={14} />

                                                Expires{" "}
                                                {formatDate(
                                                    invite.expires_at
                                                )}

                                            </div>

                                            <button
                                                type="button"
                                                disabled={revokingInvite}
                                                onClick={
                                                    handleDeactivateInvite
                                                }
                                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                            >
                                                <Trash2 size={15} />
                                                {revokingInvite
                                                    ? "Deactivating..."
                                                    : "Deactivate Link"}
                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="py-4">

                                        <div className="max-w-xl">

                                            <p className="text-sm text-slate-600">
                                                No active workspace invitation exists.
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Choose how long the invitation should remain valid.
                                            </p>


                                            <div className="mt-5 flex flex-col sm:flex-row gap-3">

                                                <select
                                                    value={
                                                        expiresInDays
                                                    }
                                                    onChange={event =>
                                                        setExpiresInDays(
                                                            Number(
                                                                event.target.value
                                                            )
                                                        )
                                                    }
                                                    className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                                >

                                                    <option value={1}>
                                                        1 day
                                                    </option>

                                                    <option value={3}>
                                                        3 days
                                                    </option>

                                                    <option value={7}>
                                                        7 days
                                                    </option>

                                                    <option value={14}>
                                                        14 days
                                                    </option>

                                                    <option value={30}>
                                                        30 days
                                                    </option>

                                                </select>


                                                <button
                                                    type="button"
                                                    disabled={creatingInvite}
                                                    onClick={
                                                        handleCreateInvite
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    <Link size={16} />

                                                    {creatingInvite
                                                        ? "Generating..."
                                                        : "Generate Invite Link"}
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* INFO */}

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

                            <div className="flex gap-3">

                                <Clock
                                    size={17}
                                    className="text-blue-600 shrink-0 mt-0.5"
                                />

                                <div>

                                    <p className="text-sm font-semibold text-blue-900">
                                        How workspace invitations work
                                    </p>

                                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                        The invitation link does not immediately add someone to the workspace.
                                        The user submits a join request, and an Owner or Admin approves or rejects it.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>


            {/* ==================================================
                ADD MEMBER MODAL
            ================================================== */}

            <AddTeamMemberModal
                open={
                    showAddMemberModal
                }
                onClose={() =>
                    setShowAddMemberModal(
                        false
                    )
                }
                onAdd={
                    handleAddMember
                }
                loading={
                    addingMember
                }
            />


            {/* ==================================================
                CONFIRM ACTION MODAL
            ================================================== */}

            <ConfirmActionModal
                open={
                    !!confirmAction
                }

                title={
                    confirmAction?.type ===
                    "make-admin"
                        ? "Make Admin"
                        : confirmAction?.type ===
                            "remove-admin"
                            ? "Remove Admin Role"
                            : "Remove Member"
                }

                message={
                    confirmAction?.type ===
                    "make-admin"
                        ? `Make ${
                            confirmAction?.member?.name ||
                            "this member"
                        } an Admin?`
                        : confirmAction?.type ===
                            "remove-admin"
                            ? `Remove Admin role from ${
                                confirmAction?.member?.name ||
                                "this member"
                            }?`
                            : `Remove ${
                                confirmAction?.member?.name ||
                                "this member"
                            } from the team?`
                }

                confirmText={
                    confirmAction?.type ===
                    "make-admin"
                        ? "Make Admin"
                        : confirmAction?.type ===
                            "remove-admin"
                            ? "Remove Admin"
                            : "Remove Member"
                }

                cancelText="Cancel"

                loading={
                    confirmLoading
                }

                onConfirm={
                    handleConfirmAction
                }

                onCancel={() =>
                    setConfirmAction(
                        null
                    )
                }
            />

        </div>

    );

}