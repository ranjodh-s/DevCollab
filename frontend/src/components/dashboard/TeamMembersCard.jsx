import {
    Users,
    Plus,
    Trash2,
    Shield,
    UserRound,
    ShieldCheck,
    ShieldOff,
    ArrowRight
} from "lucide-react";

export default function TeamMembersCard({
    members = [],
    loading = false,

    onAddMember,
    onRemoveMember,

    onMakeAdmin,
    onRemoveAdmin,

    onViewAll,

    currentUserId,
    currentUserRole,

    removingUserId = null,
    updatingUserId = null
}) {
    const isOwner =
        currentUserRole === "Owner";

    const isAdmin =
        currentUserRole === "Admin";

    const canManageMembers =
        isOwner || isAdmin;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                        <Users
                            size={20}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h2 className="font-bold text-slate-900">
                            Team Members
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                            {members.length} member
                            {members.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    HEADER ACTIONS
                ================================================== */}
                { canManageMembers &&

                <div className="flex items-center gap-2">

                    {onViewAll && (

                        <button
                            type="button"
                            onClick={onViewAll}                            
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                        >

                            Manage

                            <ArrowRight size={14} />

                        </button>

                    )}

                </div>
}
            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="p-8 flex flex-col items-center justify-center">

                    <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

                    <p className="text-sm text-slate-400 mt-3">
                        Loading members...
                    </p>

                </div>

            )}


            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading && members.length === 0 && (

                <div className="p-8 text-center">

                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">

                        <Users
                            size={22}
                            className="text-slate-400"
                        />

                    </div>

                    <p className="font-medium text-slate-700 mt-3">
                        No members yet
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                        Add someone to your workspace.
                    </p>


                    {canManageMembers && (

                        <button
                            type="button"
                            onClick={onAddMember}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >

                            <Plus size={15} />

                            Add Member

                        </button>

                    )}

                </div>

            )}


            {/* ==================================================
                MEMBERS
            ================================================== */}

            {!loading && members.length > 0 && (

                <div className="divide-y divide-slate-100">

                    {members.map((member) => {

                        const memberId =
                            member.id ??
                            member.user_id;

                        const isCurrentUser =
                            String(memberId) ===
                            String(currentUserId);

                        const isMemberAdmin =
                            member.role === "Admin";

                        const isMemberOwner =
                            member.role === "Owner";

                        const isRemoving =
                            String(removingUserId) ===
                            String(memberId);

                        const isUpdating =
                            String(updatingUserId) ===
                            String(memberId);


                        /*
                         * OWNER:
                         *
                         * Member -> Promote
                         * Admin  -> Demote
                         * Member/Admin -> Remove
                         *
                         * ADMIN:
                         *
                         * Member -> Remove
                         * Admin  -> Nothing
                         *
                         * MEMBER:
                         *
                         * Nothing
                         */

                        const canPromote =
                            isOwner &&
                            !isCurrentUser &&
                            !isMemberOwner &&
                            !isMemberAdmin;

                        const canDemote =
                            isOwner &&
                            !isCurrentUser &&
                            isMemberAdmin;

                        const canRemove =
                            canManageMembers &&
                            !isCurrentUser &&
                            !isMemberOwner &&
                            (
                                isOwner ||
                                !isMemberAdmin
                            );


                        return (

                            <div
                                key={memberId}
                                className="px-5 py-4 flex items-center gap-3"
                            >

                                {/* ==================================================
                                    AVATAR
                                ================================================== */}

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold shrink-0">

                                    {member.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "?"}

                                </div>


                                {/* ==================================================
                                    USER INFO
                                ================================================== */}

                                <div className="min-w-0 flex-1">

                                    <div className="flex items-center gap-2">

                                        <p className="font-semibold text-sm text-slate-900 truncate">

                                            {member.name ||
                                                "Unknown User"}

                                        </p>


                                        {isCurrentUser && (

                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">

                                                You

                                            </span>

                                        )}

                                    </div>


                                    <p className="text-xs text-slate-400 truncate">

                                        {member.email ||
                                            "No email"}

                                    </p>

                                </div>


                                {/* ==================================================
                                    ROLE + ACTIONS
                                ================================================== */}

                                <div className="flex items-center gap-2 shrink-0">

                                    {/* ROLE BADGE */}

                                    <span
                                        className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                                            isMemberOwner
                                                ? "bg-purple-100 text-purple-700"
                                                : isMemberAdmin
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-slate-100 text-slate-600"
                                        }`}
                                    >

                                        {isMemberOwner ||
                                        isMemberAdmin ? (

                                            <Shield size={11} />

                                        ) : (

                                            <UserRound size={11} />

                                        )}

                                        {member.role ||
                                            "Member"}

                                    </span>


                                    {/* ==================================================
                                        OWNER - MAKE ADMIN
                                    ================================================== */}

                                    {canPromote && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onMakeAdmin?.(
                                                    member
                                                )
                                            }
                                            disabled={isUpdating}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition"
                                            title="Make Admin"
                                        >

                                            {isUpdating ? (

                                                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

                                            ) : (

                                                <ShieldCheck
                                                    size={16}
                                                />

                                            )}

                                        </button>

                                    )}


                                    {/* ==================================================
                                        OWNER - REMOVE ADMIN
                                    ================================================== */}

                                    {canDemote && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRemoveAdmin?.(
                                                    member
                                                )
                                            }
                                            disabled={isUpdating}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-orange-500 hover:text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition"
                                            title="Remove Admin role"
                                        >

                                            {isUpdating ? (

                                                <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />

                                            ) : (

                                                <ShieldOff
                                                    size={16}
                                                />

                                            )}

                                        </button>

                                    )}


                                    {/* ==================================================
                                        REMOVE MEMBER
                                    ================================================== */}

                                    {canRemove && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRemoveMember?.(
                                                    member
                                                )
                                            }
                                            disabled={
                                                isRemoving ||
                                                isUpdating
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                            title="Remove member"
                                        >

                                            {isRemoving ? (

                                                <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />

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
    );
}