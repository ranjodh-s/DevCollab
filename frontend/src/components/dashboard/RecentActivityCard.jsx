import {
    Activity,
    Clock
} from "lucide-react";

export default function RecentActivityCard({
    activities = [],
    loading = false
}) {

    const formatTime = (date) => {

        if (!date) {
            return "";
        }

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


    return (

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* HEADER */}

            <div className="flex justify-between items-center p-5 border-b border-slate-100">

                <div className="flex items-center gap-2">

                    <Activity
                        size={17}
                        className="text-blue-600"
                    />

                    <h2 className="font-bold tracking-widest text-sm uppercase text-slate-900">
                        Recent Activity
                    </h2>

                </div>

                <button
                    type="button"
                    className="text-blue-600 text-sm hover:text-blue-700 transition"
                >
                    View All →
                </button>

            </div>


            {/* LOADING */}

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


            {/* EMPTY */}

            {!loading && activities.length === 0 && (

                <div className="h-32 flex flex-col items-center justify-center text-slate-400">

                    <Activity
                        size={20}
                        className="mb-2"
                    />

                    <p className="text-sm">
                        No recent activity yet.
                    </p>

                </div>

            )}


            {/* ACTIVITIES */}

            {!loading && activities.length > 0 && (

                <div className="divide-y divide-slate-100">

                    {activities.slice(0, 5).map((activity) => (

                        <div
                            key={activity.id}
                            className="px-5 py-4 hover:bg-slate-50 transition"
                        >

                            <div className="flex items-start gap-3">

                                {/* AVATAR */}

                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">

                                    <span className="text-xs font-semibold">
                                        {activity.user_name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                    </span>

                                </div>


                                {/* CONTENT */}

                                <div className="min-w-0 flex-1">

                                    <p className="text-sm text-slate-700">

                                        <span className="font-semibold text-slate-900">
                                            {activity.user_name ||
                                                "Unknown User"}
                                        </span>

                                        {" "}

                                        {activity.action ||
                                            "performed an action"}

                                    </p>


                                    {activity.details && (

                                        <p className="text-xs text-slate-500 mt-1 truncate">
                                            {activity.details}
                                        </p>

                                    )}


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