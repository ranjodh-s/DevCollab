import { Activity, Clock } from "lucide-react";

export default function TeamActivityCard({
    activities = [],
    loading = false
}) {
    const formatTime = (date) => {
        if (!date) return "";

        const activityDate = new Date(date);

        if (Number.isNaN(activityDate.getTime())) {
            return "";
        }

        return activityDate.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Convert backend action names into readable text
    const formatAction = (action) => {
        const actions = {
            PROJECT_CREATED: "created a project",
            PROJECT_UPDATED: "updated a project",
            PROJECT_DELETED: "deleted a project",

            MEMBER_ADDED: "added a member to the workspace",
            MEMBER_REMOVED: "removed a member from the workspace",

            ADMIN_ASSIGNED: "made a member an admin",
            ADMIN_REMOVED: "removed admin role from a member",

            PROJECT_MEMBER_ADDED: "added a member to a project",
            PROJECT_MEMBER_REMOVED: "removed a member from a project",
            PROJECT_MEMBER_ROLE_UPDATED: "updated a project member's role",

            JOIN_REQUEST_APPROVED: "approved a join request",
            JOIN_REQUEST_REJECTED: "rejected a join request",

            INVITATION_CREATED: "created a workspace invitation",
            INVITATION_DEACTIVATED: "deactivated a workspace invitation"
        };

        return (
            actions[action] ||
            action
                ?.replaceAll("_", " ")
                ?.toLowerCase() ||
            "performed an action"
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Activity
                        size={17}
                        className="text-blue-600"
                    />

                    <h2 className="font-bold tracking-widest text-sm uppercase text-slate-900">
                        Team Activity
                    </h2>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="h-32 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

                        <p className="text-xs text-slate-400 mt-2">
                            Loading activity...
                        </p>
                    </div>
                </div>
            )}

            {/* Empty */}
            {!loading && activities.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                    <Activity
                        size={20}
                        className="mb-2"
                    />

                    <p className="text-sm">
                        No team activity yet.
                    </p>
                </div>
            )}

            {/* Activities */}
            {!loading && activities.length > 0 && (
                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">

                    {activities
                        .slice(0, 8)
                        .map((activity) => (

                            <div
                                key={activity.id}
                                className="px-5 py-4 hover:bg-slate-50 transition"
                            >

                                <div className="flex items-start gap-3">

                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold">
                                            {activity.user_name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">

                                        <p className="text-sm text-slate-700">

                                            <span className="font-semibold text-slate-900">
                                                {activity.user_name ||
                                                    "Unknown User"}
                                            </span>

                                            {" "}

                                            {formatAction(
                                                activity.action
                                            )}

                                        </p>

                                        {/* Details */}
                                        {activity.details && (
                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                {activity.details}
                                            </p>
                                        )}

                                        {/* Time */}
                                        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">

                                            <Clock size={11} />

                                            {formatTime(
                                                activity.created_at
                                            )}

                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}