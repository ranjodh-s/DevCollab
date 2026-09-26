import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

import {
    X,
    Users,
    Search,
    UserPlus,
    Trash2,
    Loader2,
    Check
} from "lucide-react";

import {
    getProjectMembers,
    addProjectMember,
    updateProjectMemberRole,
    removeProjectMember,
    leaveProject
} from "../../api/projectMember";

import {
    getTeamMembers
} from "../../api/team";


export default function ProjectMembersModal({
    open,
    onClose,
    projectId,
    teamId
}) {

    // ======================================================
    // STATE
    // ======================================================

    const [projectMembers, setProjectMembers] =
        useState([]);

    const [workspaceMembers, setWorkspaceMembers] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [addingUserId, setAddingUserId] =
        useState(null);

    const [removingUserId, setRemovingUserId] =
        useState(null);

    const [updatingRoleUserId, setUpdatingRoleUserId] =
        useState(null);

    const [leavingProject, setLeavingProject] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [projectInfo, setProjectInfo] =
        useState(null);
    const currentUser = useAuthStore((state) => state.user);

    const currentUserId = Number(currentUser?.id);


    // ======================================================
    // PROJECT OWNER ID
    // ======================================================

    const projectOwnerId = Number(
        projectInfo?.created_by
    );
    const isProjectOwner =
        currentUserId &&
        projectOwnerId &&
        currentUserId === projectOwnerId;


    // ======================================================
    // AVAILABLE PROJECT ROLES
    // ======================================================

    const projectRoles = [
        "Manager",
        "Developer",
        "Contributor",
        "Viewer"
    ];


    // ======================================================
    // LOAD MEMBERS
    // ======================================================

    const fetchMembers = async () => {

        try {

            setLoading(true);


            const [
                projectResponse,
                teamResponse
            ] = await Promise.all([

                getProjectMembers(projectId),

                getTeamMembers(teamId)

            ]);


            // ==================================================
            // PROJECT MEMBERS RESPONSE
            // ==================================================

            const projectData =
                projectResponse?.data ||
                projectResponse ||
                {};


            setProjectInfo(
                projectData?.project ||
                null
            );


            setProjectMembers(
                Array.isArray(projectData?.members)
                    ? projectData.members
                    : []
            );


            // ==================================================
            // WORKSPACE MEMBERS RESPONSE
            // ==================================================

            const teamData =
                teamResponse?.members ||
                teamResponse?.data?.members ||
                teamResponse?.users ||
                teamResponse?.data?.users ||
                teamResponse?.data ||
                teamResponse ||
                [];


            setWorkspaceMembers(
                Array.isArray(teamData)
                    ? teamData
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD PROJECT MEMBERS ERROR:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to load project members"
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // LOAD WHEN OPENED
    // ======================================================

    useEffect(() => {

        if (!open) {
            return;
        }


        setSearch("");


        fetchMembers();

    }, [
        open,
        projectId,
        teamId
    ]);


    // ======================================================
    // EXISTING PROJECT MEMBER IDS
    // ======================================================

    const projectMemberIds = useMemo(() => {

        return new Set(

            projectMembers

                .map((member) => {

                    return Number(
                        member.user_id ??
                        member.userId ??
                        member.id
                    );

                })

                .filter(Boolean)

        );

    }, [
        projectMembers
    ]);


    // ======================================================
    // AVAILABLE WORKSPACE MEMBERS
    // ======================================================

    const availableMembers = useMemo(() => {

        return workspaceMembers.filter((member) => {

            const memberUserId = Number(

                member.user_id ??
                member.userId ??
                member.user?.id ??
                member.id

            );


            // ==================================================
            // DON'T SHOW USERS ALREADY IN PROJECT
            // ==================================================

            if (
                projectMemberIds.has(memberUserId)
            ) {

                return false;

            }


            // ==================================================
            // DON'T SHOW PROJECT OWNER
            // ==================================================

            if (
                projectOwnerId &&
                memberUserId === projectOwnerId
            ) {

                return false;

            }


            const name = String(

                member.name ??
                member.user_name ??
                member.username ??
                member.user?.name ??
                ""

            ).toLowerCase();


            const email = String(

                member.email ??
                member.user?.email ??
                ""

            ).toLowerCase();


            const query =
                search
                    .toLowerCase()
                    .trim();


            return (

                !query ||

                name.includes(query) ||

                email.includes(query)

            );

        });

    }, [
        workspaceMembers,
        projectMemberIds,
        projectOwnerId,
        search
    ]);


    // ======================================================
    // UPDATE MEMBER ROLE
    // ======================================================

    const handleRoleChange = async (
        member,
        newRole
    ) => {

        const userId =

            member.user_id ??
            member.userId ??
            member.user?.id ??
            member.id;


        if (!userId) {

            toast.error(
                "User ID is missing."
            );

            return;

        }


        // ==================================================
        // OWNER PROTECTION
        // ==================================================

        if (

            String(member.role)
                .toLowerCase() ===
            "owner"

        ) {

            toast.error(
                "The project owner's role cannot be changed."
            );

            return;

        }


        // ==================================================
        // SAME ROLE
        // ==================================================

        if (
            String(member.role) ===
            String(newRole)
        ) {

            return;

        }


        try {

            setUpdatingRoleUserId(
                userId
            );


            await updateProjectMemberRole(
                projectId,
                userId,
                newRole
            );


            toast.success(
                "Project member role updated."
            );


            await fetchMembers();

        } catch (err) {

            console.error(
                "UPDATE PROJECT MEMBER ROLE ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to update project member role."
            );

        } finally {

            setUpdatingRoleUserId(
                null
            );

        }

    };


    // ======================================================
    // ADD MEMBER
    // ======================================================

    const handleAddMember = async (member) => {

        const userId =

            member.user_id ??
            member.userId ??
            member.user?.id ??
            member.id;


        if (!userId) {

            toast.error(
                "User ID is missing."
            );

            return;

        }


        // ==================================================
        // EXTRA OWNER PROTECTION
        // ==================================================

        if (
            projectOwnerId &&
            Number(userId) === projectOwnerId
        ) {

            toast.error(
                "The project owner is already a project member."
            );

            return;

        }


        try {

            setAddingUserId(
                userId
            );


            await addProjectMember(
                projectId,
                userId
            );


            toast.success(
                `${member.name || member.email || "Member"} added to project.`
            );


            await fetchMembers();

        } catch (err) {

            console.error(
                "ADD PROJECT MEMBER ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to add project member."
            );

        } finally {

            setAddingUserId(
                null
            );

        }

    };


    // ======================================================
    // REMOVE MEMBER
    // ======================================================

    const handleRemoveMember = async (member) => {

        const userId =

            member.user_id ??
            member.userId ??
            member.user?.id ??
            member.id;


        if (!userId) {

            toast.error(
                "User ID is missing."
            );

            return;

        }


        // ==================================================
        // OWNER PROTECTION
        // ==================================================

        if (

            String(member.role)
                .toLowerCase() ===
            "owner"

        ) {

            toast.error(
                "The project owner cannot be removed."
            );

            return;

        }


        try {

            setRemovingUserId(
                userId
            );


            await removeProjectMember(
                projectId,
                userId
            );


            toast.success(
                "Project member removed."
            );


            await fetchMembers();

        } catch (err) {

            console.error(
                "REMOVE PROJECT MEMBER ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to remove project member."
            );

        } finally {

            setRemovingUserId(
                null
            );

        }

    };


    // ======================================================
    // LEAVE PROJECT
    // ======================================================

    const handleLeaveProject = async () => {

        if (leavingProject) {
            return;
        }


        const confirmed = window.confirm(
            "Are you sure you want to leave this project?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setLeavingProject(true);


            await leaveProject(
                projectId
            );


            toast.success(
                "You left the project successfully."
            );


            onClose();

        } catch (error) {

            console.error(
                "LEAVE PROJECT ERROR:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to leave the project."
            );

        } finally {

            setLeavingProject(false);

        }

    };


    // ======================================================
    // CLOSE
    // ======================================================

    const handleClose = () => {

        if (
            loading ||
            leavingProject
        ) {

            return;

        }


        onClose();

    };


    // ======================================================
    // NOT OPEN
    // ======================================================

    if (!open) {
        return null;
    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">

            {/* ==================================================
                BACKDROP
            ================================================== */}

            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={handleClose}
            />


            {/* ==================================================
                MODAL
            ================================================== */}

            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                            <Users
                                size={22}
                                className="text-blue-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-bold text-slate-900">
                                Project Members
                            </h2>

                            <p className="text-sm text-slate-500 mt-0.5">
                                Manage members working on this project
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={leavingProject}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="overflow-y-auto p-6">


                    {/* ==================================================
                        CURRENT MEMBERS
                    ================================================== */}

                    <div>

                        <div className="flex items-center justify-between mb-3">

                            <div>

                                <h3 className="font-semibold text-slate-900">
                                    Current Members
                                </h3>

                                <p className="text-xs text-slate-500 mt-1">

                                    {projectMembers.length} member
                                    {projectMembers.length !== 1
                                        ? "s"
                                        : ""}

                                </p>

                            </div>

                        </div>


                        {loading ? (

                            <div className="h-32 flex items-center justify-center">

                                <Loader2
                                    size={25}
                                    className="text-blue-600 animate-spin"
                                />

                            </div>

                        ) : projectMembers.length === 0 ? (

                            <div className="border border-dashed rounded-xl p-6 text-center">

                                <Users
                                    size={26}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-2 text-sm text-slate-500">
                                    No project members yet.
                                </p>

                            </div>

                        ) : (

                            <div className="border rounded-xl divide-y overflow-hidden">

                                {projectMembers.map(member => {

                                    const userId =

                                        member.user_id ??
                                        member.userId ??
                                        member.id;


                                    const name =

                                        member.name ||
                                        member.user_name ||
                                        member.username ||
                                        "Unknown member";


                                    const email =

                                        member.email ||
                                        "";


                                    const role =

                                        member.role ||
                                        "Contributor";


                                    const isOwner =

                                        String(role)
                                            .toLowerCase() ===
                                        "owner";


                                    const removing =

                                        String(
                                            removingUserId
                                        ) ===
                                        String(userId);


                                    const updatingRole =

                                        String(
                                            updatingRoleUserId
                                        ) ===
                                        String(userId);


                                    return (

                                        <div
                                            key={`${userId}-${member.id || ""}`}
                                            className="flex items-center justify-between gap-4 px-4 py-3.5"
                                        >

                                            {/* ==================================================
                                                MEMBER INFO
                                            ================================================== */}

                                            <div className="flex items-center gap-3 min-w-0">

                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">

                                                    <span className="text-sm font-semibold text-blue-700">

                                                        {String(name)
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </span>

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="font-medium text-sm text-slate-900 truncate">
                                                        {name}
                                                    </p>


                                                    {email && (

                                                        <p className="text-xs text-slate-500 truncate">
                                                            {email}
                                                        </p>

                                                    )}

                                                </div>

                                            </div>


                                            {/* ==================================================
                                                ROLE + ACTIONS
                                            ================================================== */}

                                            <div className="flex items-center gap-2 shrink-0">

                                                {isOwner ? (

                                                    // ==================================================
                                                    // OWNER
                                                    // ==================================================

                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        Owner
                                                    </span>

                                                ) : (

                                                    // ==================================================
                                                    // NON-OWNER ROLE SELECT
                                                    // ==================================================

                                                    <div className="relative">

                                                        <select
                                                            value={role}
                                                            disabled={
                                                                updatingRole ||
                                                                removing
                                                            }
                                                            onChange={(e) =>
                                                                handleRoleChange(
                                                                    member,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="appearance-none min-w-[125px] px-3 py-1.5 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 cursor-pointer"
                                                        >

                                                            {projectRoles.map(
                                                                projectRole => (

                                                                    <option
                                                                        key={projectRole}
                                                                        value={projectRole}
                                                                    >
                                                                        {projectRole}
                                                                    </option>

                                                                )
                                                            )}

                                                        </select>


                                                        {updatingRole && (

                                                            <Loader2
                                                                size={13}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 animate-spin pointer-events-none"
                                                            />

                                                        )}

                                                    </div>

                                                )}


                                                {/* ==================================================
                                                    REMOVE
                                                ================================================== */}

                                                {!isOwner && (

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            removing ||
                                                            updatingRole
                                                        }
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member
                                                            )
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                                        title="Remove member"
                                                    >

                                                        {removing ? (

                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        DIVIDER
                    ================================================== */}

                    <div className="border-t my-7" />


                    {/* ==================================================
                        ADD WORKSPACE MEMBERS
                    ================================================== */}

                    <div>

                        <div className="flex items-start justify-between gap-4 mb-4">

                            <div>

                                <h3 className="font-semibold text-slate-900">
                                    Add Workspace Members
                                </h3>

                                <p className="text-xs text-slate-500 mt-1">
                                    Add existing workspace members to this project.
                                </p>

                            </div>


                            <UserPlus
                                size={20}
                                className="text-slate-400 shrink-0"
                            />

                        </div>


                        {/* ==================================================
                            SEARCH
                        ================================================== */}

                        <div className="relative">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />


                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />

                        </div>


                        {/* ==================================================
                            AVAILABLE MEMBERS
                        ================================================== */}

                        <div className="mt-3 border rounded-xl overflow-hidden">

                            {availableMembers.length === 0 ? (

                                <div className="p-6 text-center">

                                    <Check
                                        size={24}
                                        className="mx-auto text-green-500"
                                    />

                                    <p className="mt-2 text-sm font-medium text-slate-700">

                                        {search

                                            ? "No matching workspace members"

                                            : "All workspace members are already in this project"}

                                    </p>

                                </div>

                            ) : (

                                <div className="max-h-64 overflow-y-auto divide-y">

                                    {availableMembers.map(member => {

                                        const userId =

                                            member.user_id ??
                                            member.userId ??
                                            member.user?.id ??
                                            member.id;


                                        const name =

                                            member.name ||
                                            member.user_name ||
                                            member.username ||
                                            "Unknown member";


                                        const email =

                                            member.email ||
                                            "";


                                        const adding =

                                            String(
                                                addingUserId
                                            ) ===
                                            String(userId);


                                        return (

                                            <div
                                                key={userId}
                                                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 transition"
                                            >

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">

                                                        <span className="text-xs font-semibold text-slate-600">

                                                            {String(name)
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </span>

                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="text-sm font-medium text-slate-800 truncate">
                                                            {name}
                                                        </p>


                                                        {email && (

                                                            <p className="text-xs text-slate-500 truncate">
                                                                {email}
                                                            </p>

                                                        )}

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    disabled={adding}
                                                    onClick={() =>
                                                        handleAddMember(
                                                            member
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
                                                >

                                                    {adding ? (

                                                        <Loader2
                                                            size={14}
                                                            className="animate-spin"
                                                        />

                                                    ) : (

                                                        <UserPlus
                                                            size={14}
                                                        />

                                                    )}


                                                    {adding

                                                        ? "Adding..."

                                                        : "Add"}

                                                </button>

                                            </div>

                                        );

                                    })}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        LEAVE PROJECT
                    ================================================== */}

                    {!isProjectOwner && (
                        <div className="border-t border-gray-200 mt-7 pt-5">

                            <button
                                type="button"
                                onClick={handleLeaveProject}
                                disabled={
                                    leavingProject ||
                                    loading
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {leavingProject ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Leaving project...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Leave Project
                                    </>
                                )}

                            </button>

                        </div>
                    )}

                </div>

            </div>

        </div>

    );

}