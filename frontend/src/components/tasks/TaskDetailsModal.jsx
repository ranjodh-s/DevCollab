import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function TaskModal({
    open,
    onClose,
    onSubmit,
    task,
    projects,
    members,
    loading
}) {

    const isEditing =
        Boolean(task);


    const [form, setForm] = useState({
        project_id: "",
        title: "",
        description: "",
        priority: "Medium",
        assigned_to: "",
        due_date: "",
        status: "Todo"
    });


    // ======================================================
    // LOAD TASK INTO FORM
    // ======================================================

    useEffect(() => {

        if (task) {

            setForm({

                project_id:
                    task.project_id || "",

                title:
                    task.title || "",

                description:
                    task.description || "",

                priority:
                    task.priority || "Medium",

                assigned_to:
                    task.assigned_to || "",

                due_date:
                    task.due_date
                        ? String(task.due_date).slice(0, 10)
                        : "",

                status:
                    task.status || "Todo"

            });

        } else {

            setForm({

                project_id: "",
                title: "",
                description: "",
                priority: "Medium",
                assigned_to: "",
                due_date: "",
                status: "Todo"

            });

        }

    }, [task, open]);


    // ======================================================
    // CLOSE
    // ======================================================

    if (!open) {
        return null;
    }


    // ======================================================
    // HANDLE CHANGE
    // ======================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // ======================================================
    // SUBMIT
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!form.title.trim()) {
            return;
        }


        if (!isEditing && !form.project_id) {
            return;
        }


        await onSubmit({

            ...form,

            project_id:
                Number(form.project_id),

            assigned_to:
                form.assigned_to
                    ? Number(form.assigned_to)
                    : null,

            due_date:
                form.due_date ||
                null

        });

    };


    return (

        <div
            className="
                fixed
                inset-0
                z-50
                bg-black/40
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    bg-white
                    w-full
                    max-w-lg
                    rounded-xl
                    shadow-xl
                    max-h-[90vh]
                    overflow-y-auto
                "
            >

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-6
                        py-4
                        border-b
                    "
                >

                    <div>

                        <h2 className="text-lg font-semibold text-slate-900">

                            {isEditing
                                ? "Edit Task"
                                : "Create Task"
                            }

                        </h2>

                        <p className="text-sm text-slate-500 mt-1">

                            {isEditing
                                ? "Update task details."
                                : "Create a task for one of your projects."
                            }

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            p-2
                            rounded-lg
                            text-slate-400
                            hover:bg-slate-100
                            hover:text-slate-600
                        "
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* ==========================================
                    FORM
                ========================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    {/* ======================================
                        PROJECT
                    ====================================== */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project
                        </label>

                        <select
                            name="project_id"
                            value={
                                form.project_id
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                isEditing
                            }
                            required
                            className="
                                w-full
                                px-3
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                disabled:bg-slate-100
                            "
                        >

                            <option value="">
                                Select project
                            </option>

                            {projects.map(
                                project => (

                                    <option
                                        key={
                                            project.id
                                        }
                                        value={
                                            project.id
                                        }
                                    >

                                        {
                                            project.name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* ======================================
                        TITLE
                    ====================================== */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Task title
                        </label>

                        <input
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                handleChange
                            }
                            required
                            placeholder="e.g. Build login page"
                            className="
                                w-full
                                px-3
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                    </div>


                    {/* ======================================
                        DESCRIPTION
                    ====================================== */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            rows="3"
                            placeholder="Describe the task..."
                            className="
                                w-full
                                px-3
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                outline-none
                                resize-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                    </div>


                    {/* ======================================
                        PRIORITY + STATUS
                    ====================================== */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Priority
                            </label>

                            <select
                                name="priority"
                                value={
                                    form.priority
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    px-3
                                    py-2.5
                                    border
                                    border-slate-200
                                    rounded-lg
                                    outline-none
                                "
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

                            </select>

                        </div>


                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    form.status
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    px-3
                                    py-2.5
                                    border
                                    border-slate-200
                                    rounded-lg
                                    outline-none
                                "
                            >

                                <option value="Todo">
                                    Todo
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ======================================
                        ASSIGNEE
                    ====================================== */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Assign to
                        </label>

                        <select
                            name="assigned_to"
                            value={
                                form.assigned_to
                            }
                            onChange={
                                handleChange
                            }
                            className="
                                w-full
                                px-3
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        >

                            <option value="">
                                Unassigned
                            </option>

                            {members.map(
                                member => {

                                    const memberId =
                                        member.id ??
                                        member.user_id;

                                    return (

                                        <option
                                            key={
                                                memberId
                                            }
                                            value={
                                                memberId
                                            }
                                        >

                                            {
                                                member.name ||
                                                member.email ||
                                                `User ${memberId}`
                                            }

                                        </option>

                                    );

                                }
                            )}

                        </select>

                    </div>


                    {/* ======================================
                        DUE DATE
                    ====================================== */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Due date
                        </label>

                        <input
                            type="date"
                            name="due_date"
                            value={
                                form.due_date
                            }
                            onChange={
                                handleChange
                            }
                            className="
                                w-full
                                px-3
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                    </div>


                    {/* ======================================
                        BUTTONS
                    ====================================== */}

                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-4
                                py-2.5
                                border
                                border-slate-200
                                rounded-lg
                                text-slate-600
                                hover:bg-slate-50
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="
                                px-4
                                py-2.5
                                bg-blue-600
                                text-white
                                rounded-lg
                                hover:bg-blue-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {loading
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Create Task"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}