import { useEffect, useState } from "react";

import {
    X,
    Save,
    AlignLeft,
    Flag,
    CalendarDays,
    CheckCircle2,
    UserRound
} from "lucide-react";

import {
    getTeamMembers
} from "../../api/team";


// ======================================================
// NORMALIZE STATUS FOR UI
// ======================================================

const normalizeStatusForUI = (status) => {

    if (!status) {
        return "Todo";
    }


    // Backend may send an object

    if (
        typeof status === "object" &&
        status !== null
    ) {

        status =
            status.name ??
            status.label ??
            status.status ??
            status.value ??
            "Todo";
    }


    const value =
        String(status)
            .trim()
            .toLowerCase()
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ");


    // TODO

    if (
        value === "todo" ||
        value === "to do" ||
        value === "pending"
    ) {

        return "Todo";
    }


    // IN PROGRESS

    if (
        value === "in progress" ||
        value === "progress"
    ) {

        return "In Progress";
    }


    // REVIEW

    if (
        value === "review" ||
        value === "in review"
    ) {

        return "Review";
    }


    // COMPLETED

    if (
        value === "completed" ||
        value === "complete" ||
        value === "done"
    ) {

        return "Completed";
    }


    // CANCELLED

    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "Cancelled";
    }


    return "Todo";
};


// ======================================================
// GET TASK STATUS
// ======================================================

const getTaskStatus = (task) => {

    if (!task) {
        return "Todo";
    }


    const status =
        task.status ??
        task.statusName ??
        task.status_name ??
        task.taskStatus ??
        task.task_status ??
        task.currentStatus ??
        task.current_status ??
        task.statusLabel ??
        task.status_label ??
        task.statusValue ??
        task.status_value ??
        "Todo";


    return normalizeStatusForUI(
        status
    );
};


// ======================================================
// GET DUE DATE
// ======================================================

const getDueDate = (task) => {

    const date =
        task?.dueDate ??
        task?.due_date ??
        "";


    if (
        date &&
        typeof date === "string"
    ) {

        // Example:
        //
        // 2026-08-26T18:30:00.000Z

        if (
            date.includes("T")
        ) {

            return date.split("T")[0];
        }


        // Already:
        //
        // 2026-08-26

        return date;
    }


    return "";
};


// ======================================================
// GET ASSIGNED USER ID
// ======================================================

const getAssignedUserId = (task) => {

    if (!task) {
        return "";
    }


    const assigned =
        task.assigned_to ??
        task.assignedTo ??
        task.assigned_user_id ??
        task.assignedUserId ??
        "";


    // If backend returns an object

    if (
        typeof assigned === "object" &&
        assigned !== null
    ) {

        return (
            assigned.id ??
            assigned.user_id ??
            ""
        );
    }


    return assigned;
};


// ======================================================
// COMPONENT
// ======================================================

export default function EditTaskModal({
    task,
    open,
    onClose,
    onSave,
    teamId
}) {


    // ======================================================
    // FORM DATA
    // ======================================================

    const [
        formData,
        setFormData
    ] = useState({

        title: "",

        description: "",

        priority: "Medium",

        dueDate: "",

        status: "Todo",

        assignedTo: ""

    });


    // ======================================================
    // TEAM MEMBERS
    // ======================================================

    const [
        teamMembers,
        setTeamMembers
    ] = useState([]);


    const [
        loadingMembers,
        setLoadingMembers
    ] = useState(false);


    // ======================================================
    // SAVING
    // ======================================================

    const [
        saving,
        setSaving
    ] = useState(false);


    // ======================================================
    // LOAD TEAM MEMBERS
    // ======================================================

    useEffect(() => {

        if (
            !open ||
            !teamId
        ) {

            return;
        }


        const loadMembers = async () => {

            try {

                setLoadingMembers(
                    true
                );


                const response =
                    await getTeamMembers(
                        teamId
                    );


                console.log(
                    "TEAM MEMBERS RESPONSE:",
                    response
                );


                const members =
                    response?.members ||
                    response?.data?.members ||
                    response?.data ||
                    response ||
                    [];


                setTeamMembers(
                    Array.isArray(members)
                        ? members
                        : []
                );

            } catch (error) {

                console.error(
                    "LOAD TEAM MEMBERS ERROR:",
                    error
                );


                setTeamMembers([]);

            } finally {

                setLoadingMembers(
                    false
                );

            }
        };


        loadMembers();

    }, [
        open,
        teamId
    ]);


    // ======================================================
    // LOAD TASK INTO FORM
    // ======================================================

    useEffect(() => {

        if (
            !task ||
            !open
        ) {

            return;
        }


        const currentStatus =
            getTaskStatus(
                task
            );


        const assignedTo =
            getAssignedUserId(
                task
            );


        console.log(
            "================================"
        );


        console.log(
            "EDIT MODAL TASK:",
            task
        );


        console.log(
            "EDIT MODAL UI STATUS:",
            currentStatus
        );


        console.log(
            "EDIT MODAL ASSIGNED TO:",
            assignedTo
        );


        console.log(
            "================================"
        );


        setFormData({

            title:
                task.title ??
                task.name ??
                "",

            description:
                task.description ??
                "",

            priority:
                task.priority ??
                "Medium",

            dueDate:
                getDueDate(
                    task
                ),

            status:
                currentStatus,

            assignedTo:
                assignedTo !== null &&
                assignedTo !== undefined
                    ? String(
                        assignedTo
                    )
                    : ""

        });


        setSaving(
            false
        );

    }, [
        task,
        open
    ]);


    // ======================================================
    // DON'T RENDER
    // ======================================================

    if (
        !open ||
        !task
    ) {

        return null;
    }


    // ======================================================
    // HANDLE INPUT
    // ======================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // ======================================================
    // SUBMIT
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            !formData.title.trim()
        ) {

            return;
        }


        try {

            setSaving(
                true
            );


            await onSave({

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                priority:
                    formData.priority,

                dueDate:
                    formData.dueDate ||
                    null,

                status:
                    formData.status,

                assignedTo:
                    formData.assignedTo ||
                    null

            });

        } finally {

            setSaving(
                false
            );

        }
    };


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">


            {/* ==================================================
                BACKDROP
            ================================================== */}

            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => {

                    if (!saving) {
                        onClose();
                    }

                }}
            />


            {/* ==================================================
                MODAL
            ================================================== */}

            <div className="relative w-full max-h-screen overflow-y-scroll scrollbar-none max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="sticky top-0 bg-white shadow-lg z-10 flex items-center justify-between px-6 py-5 ">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">

                            Edit Task

                        </p>


                        <h2 className="text-xl font-bold text-slate-900 mt-1">

                            Update task

                        </h2>


                        <p className="text-sm text-slate-500 mt-1">

                            Make changes to this task.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="p-6 space-y-5"
                >


                    {/* ==================================================
                        TITLE
                    ================================================== */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            Task Title

                        </label>


                        <div className="relative">

                            <AlignLeft
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />


                            <input
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    saving
                                }
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />

                        </div>

                    </div>


                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            Description

                            <span className="font-normal text-slate-400">

                                {" "}
                                Optional

                            </span>

                        </label>


                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                saving
                            }
                            rows={4}
                            placeholder="Describe what needs to be done..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />

                    </div>


                    {/* ==================================================
                        PRIORITY + STATUS
                    ================================================== */}

                    <div className="grid grid-cols-2 gap-4">


                        {/* ==================================================
                            PRIORITY
                        ================================================== */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">

                                Priority

                            </label>


                            <div className="relative">

                                <Flag
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />


                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full appearance-none pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >

                                    <option value="Low">
                                        Low
                                    </option>


                                    <option value="Medium">
                                        Medium
                                    </option>


                                    <option value="High">
                                        High
                                    </option>


                                    <option value="Urgent">
                                        Urgent
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* ==================================================
                            STATUS
                        ================================================== */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">

                                Status

                            </label>


                            <div className="relative">

                                <CheckCircle2
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />


                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full appearance-none pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >

                                    <option value="Todo">
                                        Todo
                                    </option>


                                    <option value="In Progress">
                                        In Progress
                                    </option>


                                    <option value="Review">
                                        Review
                                    </option>


                                    <option value="Completed">
                                        Completed
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        ASSIGNED TO
                    ================================================== */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            Assigned To

                            <span className="font-normal text-slate-400">

                                {" "}
                                Optional

                            </span>

                        </label>


                        <div className="relative">

                            <UserRound
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />


                            <select
                                name="assignedTo"
                                value={
                                    formData.assignedTo
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    saving ||
                                    loadingMembers
                                }
                                className="w-full appearance-none pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >

                                <option value="">
                                    Unassigned
                                </option>


                                {teamMembers.map(
                                    member => (

                                        <option
                                            key={
                                                member.id
                                            }
                                            value={
                                                member.id
                                            }
                                        >

                                            {member.name}

                                            {member.email
                                                ? ` (${member.email})`
                                                : ""
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {loadingMembers && (

                            <p className="text-xs text-slate-400 mt-1">

                                Loading team members...

                            </p>

                        )}


                        {!loadingMembers &&
                            teamMembers.length === 0 && (

                                <p className="text-xs text-slate-400 mt-1">

                                    No team members found.

                                </p>

                            )}

                    </div>


                    {/* ==================================================
                        DUE DATE
                    ================================================== */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            Due Date

                        </label>


                        <div className="relative">

                            <CalendarDays
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />


                            <input
                                type="date"
                                name="dueDate"
                                value={
                                    formData.dueDate
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    saving
                                }
                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />

                        </div>

                    </div>


                    {/* ==================================================
                        CURRENT ASSIGNMENT INFO
                    ================================================== */}

                    {formData.assignedTo && (

                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">

                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">

                                <UserRound
                                    size={17}
                                    className="text-blue-600"
                                />

                            </div>


                            <div>

                                <p className="text-xs text-blue-500 font-medium">
                                    Assigned member
                                </p>


                                <p className="text-sm font-semibold text-blue-900">

                                    {teamMembers.find(
                                        member =>
                                            String(
                                                member.id
                                            ) ===
                                            String(
                                                formData.assignedTo
                                            )
                                    )?.name ||
                                        task.assigned_to_name ||
                                        "Selected member"}

                                </p>

                            </div>

                        </div>

                    )}


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex justify-end gap-3 pt-3">


                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                saving
                            }
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
                        >

                            Cancel

                        </button>


                        {/* SAVE */}

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                !formData.title.trim()
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >

                            <Save
                                size={18}
                            />


                            {saving
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}