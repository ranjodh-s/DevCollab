import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Search,
    Plus,
    Filter,
    Calendar,
    User,
    FolderKanban,
    Pencil,
    Trash2,
    ChevronDown,
    CheckCircle2,
    Clock3,
    Circle,
    ListTodo
} from "lucide-react";

import useAuthStore from "../store/authStore";

import {
    getTeamTasks,
    createTask,
    updateTaskById,
    updateTaskStatusById,
    deleteTaskById
} from "../api/task";

import { getTeamMembers } from "../api";

import TaskModal from "../components/tasks/TaskDetailsModal";


export default function Tasks() {

    const navigate = useNavigate();

    const { teamId } = useParams();

    const user = useAuthStore(
        state => state.user
    );


    // ======================================================
    // TASKS
    // ======================================================

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] =
        useState(true);

    // ======================================================
    // TASK MODAL
    // ======================================================

    const [showTaskModal, setShowTaskModal] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState(null);

    const [savingTask, setSavingTask] =
        useState(false);


    // ======================================================
    // OPEN CREATE TASK
    // ======================================================

    const handleCreateTask = () => {

        setEditingTask(null);

        setShowTaskModal(true);

    };

    // ======================================================
    // OPEN EDIT TASK
    // ======================================================

    const handleEditTask = (task) => {

        if (!task) {
            return;
        }


        setEditingTask(task);

        setShowTaskModal(true);

    };

    // ======================================================
    // SAVE TASK
    // ======================================================

    const handleSaveTask = async (data) => {

        try {

            setSavingTask(true);


            // ==============================================
            // EDIT
            // ==============================================

            if (editingTask) {

                const response =
                    await updateTaskById(
                        editingTask.id,
                        data
                    );


                const updatedTask =
                    response?.data?.task ||
                    response?.task ||
                    response?.data ||
                    data;


                setTasks(prev =>
                    prev.map(task =>
                        task.id === editingTask.id
                            ? {
                                ...task,
                                ...updatedTask
                            }
                            : task
                    )
                );


                toast.success(
                    "Task updated successfully."
                );

            }


            // ==============================================
            // CREATE
            // ==============================================

            else {

                const response =
                    await createTask(data);


                const newTask =
                    response?.data?.task ||
                    response?.task ||
                    response?.data;


                toast.success(
                    "Task created successfully."
                );


                // Refresh because the backend
                // may return a different task shape.

                await fetchTasks();

            }


            setShowTaskModal(false);

            setEditingTask(null);


        } catch (error) {

            console.error(
                "SAVE TASK ERROR:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save task."
            );


        } finally {

            setSavingTask(false);

        }

    };

    // ======================================================
    // FILTERS
    // ======================================================

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [priorityFilter, setPriorityFilter] =
        useState("All");

    const [projectFilter, setProjectFilter] =
        useState("All");

    const [assigneeFilter, setAssigneeFilter] =
        useState("All");

    const [dueFilter, setDueFilter] =
        useState("All");

    // ======================================================
    // TEAM MEMBERS
    // ======================================================

    const [members, setMembers] =
        useState([]);

    const [loadingMembers, setLoadingMembers] =
        useState(true);


    // ======================================================
    // ACTION STATES
    // ======================================================

    const [updatingTaskId, setUpdatingTaskId] =
        useState(null);

    const [deletingTaskId, setDeletingTaskId] =
        useState(null);


    // ======================================================
    // LOAD TASKS
    // ======================================================

    const fetchTasks = async () => {

        try {

            setLoading(true);


            const response =
                await getTeamTasks(teamId);


            const taskList =
                response?.tasks ||
                response?.data?.tasks ||
                response?.data ||
                response ||
                [];


            setTasks(
                Array.isArray(taskList)
                    ? taskList
                    : []
            );


        } catch (error) {

            console.error(
                "FETCH TEAM TASKS ERROR:",
                error
            );


            setTasks([]);


            toast.error(
                error?.response?.data?.message ||
                "Failed to load tasks."
            );


        } finally {

            setLoading(false);

        }

    };

    // ======================================================
    // LOAD TEAM MEMBERS
    // ======================================================

    const fetchMembers = async () => {

        try {

            setLoadingMembers(true);


            const response =
                await getTeamMembers(teamId);


            const memberList =
                response?.members ||
                response?.data?.members ||
                response?.data ||
                response ||
                [];


            setMembers(
                Array.isArray(memberList)
                    ? memberList
                    : []
            );


        } catch (error) {

            console.error(
                "FETCH TEAM MEMBERS ERROR:",
                error
            );


            setMembers([]);


            toast.error(
                error?.response?.data?.message ||
                "Failed to load team members."
            );


        } finally {

            setLoadingMembers(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        if (!teamId) {
            return;
        }


        fetchTasks();

        fetchMembers();

    }, [teamId]);


    // ======================================================
    // PROJECT LIST
    // ======================================================

    const projects = useMemo(() => {

        const map = new Map();


        tasks.forEach(task => {

            if (
                task.project_id &&
                task.project_name
            ) {

                map.set(
                    String(task.project_id),
                    {
                        id: task.project_id,
                        name: task.project_name
                    }
                );

            }

        });


        return Array.from(
            map.values()
        );

    }, [tasks]);





    // ======================================================
    // FILTER TASKS
    // ======================================================

    const filteredTasks = useMemo(() => {

        const searchValue =
            search
                .trim()
                .toLowerCase();


        return tasks.filter(task => {

            // ------------------------------------------
            // SEARCH
            // ------------------------------------------

            const matchesSearch =
                !searchValue ||
                task.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                task.description
                    ?.toLowerCase()
                    .includes(searchValue) ||
                task.project_name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                task.assigned_to_name
                    ?.toLowerCase()
                    .includes(searchValue);


            // ------------------------------------------
            // STATUS
            // ------------------------------------------

            const matchesStatus =
                statusFilter === "All" ||
                task.status === statusFilter;


            // ------------------------------------------
            // PRIORITY
            // ------------------------------------------

            const matchesPriority =
                priorityFilter === "All" ||
                task.priority === priorityFilter;


            // ------------------------------------------
            // PROJECT
            // ------------------------------------------

            const matchesProject =
                projectFilter === "All" ||
                String(task.project_id) ===
                String(projectFilter);


            // ------------------------------------------
            // ASSIGNEE
            // ------------------------------------------

            const matchesAssignee =
                assigneeFilter === "All" ||
                String(task.assigned_to) ===
                String(assigneeFilter);

            const matchesDue =
                dueFilter === "All" ||
                (
                    dueFilter === "Overdue" &&
                    isOverdue(
                        task.due_date,
                        task.status
                    )
                ) ||
                (
                    dueFilter === "Today" &&
                    isToday(task.due_date)
                );


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesProject &&
                matchesAssignee &&
                matchesDue

            );

        });

    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        projectFilter,
        assigneeFilter,
        dueFilter
    ]);


    // ======================================================
    // STATISTICS
    // ======================================================

    const stats = useMemo(() => {

        const total =
            tasks.length;


        const todo =
            tasks.filter(
                task =>
                    task.status === "Todo"
            ).length;


        const inProgress =
            tasks.filter(
                task =>
                    task.status === "In Progress"
            ).length;


        const completed =
            tasks.filter(
                task =>
                    task.status === "Completed"
            ).length;


        const myTasks =
            tasks.filter(
                task =>
                    String(
                        task.assigned_to
                    ) ===
                    String(user?.id)
            ).length;

        const overdue =
            tasks.filter(
                task =>
                    isOverdue(
                        task.due_date,
                        task.status
                    )
            ).length;

        return {
            total,
            todo,
            inProgress,
            completed,
            myTasks,
            overdue
        };

    }, [
        tasks,
        user?.id
    ]);


    // ======================================================
    // UPDATE STATUS
    // ======================================================

    const handleStatusChange = async (
        task,
        status
    ) => {

        if (!task) {
            return;
        }


        try {

            setUpdatingTaskId(
                task.id
            );


            await updateTaskStatusById(
                task.id,
                status
            );


            setTasks(prev =>
                prev.map(item =>
                    item.id === task.id
                        ? {
                            ...item,
                            status
                        }
                        : item
                )
            );


            toast.success(
                "Task status updated."
            );


        } catch (error) {

            console.error(
                "UPDATE TASK STATUS ERROR:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to update task status."
            );


        } finally {

            setUpdatingTaskId(null);

        }

    };


    // ======================================================
    // DELETE TASK
    // ======================================================

    const handleDeleteTask = async (
        task
    ) => {

        if (!task) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${task.title}"? This action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingTaskId(
                task.id
            );


            await deleteTaskById(
                task.id
            );


            setTasks(prev =>
                prev.filter(
                    item =>
                        item.id !== task.id
                )
            );


            toast.success(
                "Task deleted successfully."
            );


        } catch (error) {

            console.error(
                "DELETE TASK ERROR:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to delete task."
            );


        } finally {

            setDeletingTaskId(null);

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div
                        className="
                            w-9
                            h-9
                            border-4
                            border-blue-200
                            border-t-blue-600
                            rounded-full
                            animate-spin
                            mx-auto
                        "
                    />

                    <p className="mt-3 text-slate-500">
                        Loading tasks...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="min-h-screen bg-slate-50 p-8">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Tasks
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Manage tasks across all your projects.
                    </p>

                </div>


                <button
                    onClick={
                        handleCreateTask
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        bg-blue-600
                        text-white
                        rounded-lg
                        hover:bg-blue-700
                        transition
                        font-medium
                    "
                >

                    <Plus size={18} />

                    Create Task

                </button>

            </div>


            {/* ==========================================
                STATISTICS
            ========================================== */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

                <StatCard
                    icon={
                        <ListTodo size={20} />
                    }
                    label="Total Tasks"
                    value={stats.total}
                />


                <StatCard
                    icon={
                        <Circle size={20} />
                    }
                    label="Todo"
                    value={stats.todo}
                />


                <StatCard
                    icon={
                        <Clock3 size={20} />
                    }
                    label="In Progress"
                    value={stats.inProgress}
                />


                <StatCard
                    icon={
                        <CheckCircle2 size={20} />
                    }
                    label="Completed"
                    value={stats.completed}
                />


                <StatCard
                    icon={
                        <Clock3 size={20} />
                    }
                    label="Overdue"
                    value={
                        stats.overdue
                    }
                />

            </div>


            {/* ==========================================
                FILTER BAR
            ========================================== */}

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">

                <div className="flex flex-col xl:flex-row gap-3">

                    {/* SEARCH */}

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            value={search}
                            onChange={e =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search tasks..."
                            className="
                                w-full
                                pl-10
                                pr-4
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


                    {/* STATUS */}

                    <FilterSelect
                        value={
                            statusFilter
                        }
                        onChange={
                            setStatusFilter
                        }
                        options={[
                            "All",
                            "Todo",
                            "In Progress",
                            "Completed"
                        ]}
                    />


                    {/* PRIORITY */}

                    <FilterSelect
                        value={
                            priorityFilter
                        }
                        onChange={
                            setPriorityFilter
                        }
                        options={[
                            "All",
                            "Low",
                            "Medium",
                            "High"
                        ]}
                    />

                    {/* DUE FILTER */}

                    <FilterSelect
                        value={
                            dueFilter
                        }
                        onChange={
                            setDueFilter
                        }
                        options={[
                            "All",
                            "Overdue",
                            "Today"
                        ]}
                    />


                    {/* PROJECT */}

                    <select
                        value={
                            projectFilter
                        }
                        onChange={e =>
                            setProjectFilter(
                                e.target.value
                            )
                        }
                        className="
                            px-3
                            py-2.5
                            border
                            border-slate-200
                            rounded-lg
                            bg-white
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                        "
                    >

                        <option value="All">
                            All Projects
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


                    {/* ASSIGNEE */}

                    <select
                        value={
                            assigneeFilter
                        }
                        onChange={e =>
                            setAssigneeFilter(
                                e.target.value
                            )
                        }
                        className="
                            px-3
                            py-2.5
                            border
                            border-slate-200
                            rounded-lg
                            bg-white
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                        "
                    >

                        <option value="All">
                            All Assignees
                        </option>

                        {members.map(
                            member => {

                                const memberId =
                                    member.id ??
                                    member.user_id;

                                return (

                                    <option
                                        key={memberId}
                                        value={memberId}
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

            </div>


            {/* ==========================================
                TASK TABLE
            ========================================== */}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-slate-50 border-b border-slate-200">

                            <tr>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Task
                                </th>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Project
                                </th>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Assignee
                                </th>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Priority
                                </th>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Due Date
                                </th>

                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Status
                                </th>

                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredTasks.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="px-6 py-16 text-center"
                                    >

                                        <ListTodo
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No tasks found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your filters or search.
                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                filteredTasks.map(
                                    task => (

                                        <TaskRow
                                            key={
                                                task.id
                                            }
                                            task={
                                                task
                                            }
                                            navigate={
                                                navigate
                                            }
                                            updating={
                                                updatingTaskId ===
                                                task.id
                                            }
                                            deleting={
                                                deletingTaskId ===
                                                task.id
                                            }
                                            onStatusChange={
                                                handleStatusChange
                                            }
                                            onEdit={
                                                handleEditTask
                                            }
                                            onDelete={
                                                handleDeleteTask
                                            }
                                        />

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==========================================
                RESULT COUNT
            ========================================== */}

            <div className="mt-4 text-sm text-slate-500">

                Showing{" "}
                <span className="font-medium text-slate-700">
                    {filteredTasks.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                    {tasks.length}
                </span>{" "}
                tasks

            </div>

            {/* ==========================================
    TASK MODAL
========================================== */}

            <TaskModal

                open={
                    showTaskModal
                }

                onClose={() => {

                    setShowTaskModal(false);

                    setEditingTask(null);

                }}

                onSubmit={
                    handleSaveTask
                }

                task={
                    editingTask
                }

                projects={
                    projects
                }

                members={
                    members
                }

                loading={
                    savingTask
                }

            />

        </div>

    );

}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
    icon,
    label,
    value
}) {

    return (

        <div className="bg-white border border-slate-200 rounded-xl p-5">

            <div className="flex items-center justify-between">

                <div className="text-slate-400">
                    {icon}
                </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
                {value}
            </p>

        </div>

    );

}


// ======================================================
// FILTER SELECT
// ======================================================

function FilterSelect({
    value,
    onChange,
    options
}) {

    return (

        <div className="relative">

            <select
                value={value}
                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
                className="
                    appearance-none
                    w-full
                    min-w-[150px]
                    px-3
                    pr-9
                    py-2.5
                    border
                    border-slate-200
                    rounded-lg
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                "
            >

                {options.map(
                    option => (

                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>

                    )
                )}

            </select>

            <ChevronDown
                size={16}
                className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    pointer-events-none
                    text-slate-400
                "
            />

        </div>

    );

}

// ======================================================
// TASK DATE HELPERS
// ======================================================

const getDateOnly = (date) => {

    if (!date) {
        return null;
    }

    return new Date(
        `${String(date).slice(0, 10)}T00:00:00`
    );

};


const isOverdue = (date, status) => {

    if (
        !date ||
        status === "Completed"
    ) {
        return false;
    }

    const dueDate =
        getDateOnly(date);

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return dueDate < today;

};


const isToday = (date) => {

    if (!date) {
        return false;
    }

    const dueDate =
        getDateOnly(date);

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return (
        dueDate.getTime() ===
        today.getTime()
    );

};


// ======================================================
// TASK ROW
// ======================================================

function TaskRow({
    task,
    navigate,
    updating,
    deleting,
    onEdit,
    onDelete
}) {

    const statusClass = {

        Todo:
            "bg-slate-100 text-slate-700",

        "In Progress":
            "bg-blue-100 text-blue-700",

        Completed:
            "bg-green-100 text-green-700"

    };


    const priorityClass = {

        Low:
            "text-slate-500",

        Medium:
            "text-yellow-600",

        High:
            "text-red-600"

    };


    const overdue =
        isOverdue(
            task.due_date,
            task.status
        );


    const today =
        isToday(
            task.due_date
        );


    // ======================================================
    // DUE DATE LABEL
    // ======================================================

    const getDueDateLabel = () => {

        if (!task.due_date) {
            return "No date";
        }


        if (
            overdue &&
            task.status !== "Completed"
        ) {

            return "Overdue";

        }


        if (today) {
            return "Today";
        }


        return new Date(
            `${String(task.due_date).slice(0, 10)}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ======================================================
    // OPEN TASK
    // ======================================================

    const handleOpenTask = () => {

        navigate(
            `/team/${task.team_id}/project/${task.project_id}/task/${task.id}`
        );

    };


    return (

        <tr
            className="
                border-b
                border-slate-100
                hover:bg-slate-50
                transition
            "
        >

            {/* ==========================================
                TASK
            ========================================== */}

            <td className="px-6 py-4">

                <div className="max-w-sm">

                    <button
                        onClick={
                            handleOpenTask
                        }
                        className="
                            text-left
                            font-medium
                            text-slate-900
                            hover:text-blue-600
                            transition
                        "
                    >

                        {task.title}

                    </button>


                    {task.description && (

                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-400
                                truncate
                            "
                        >
                            {task.description}
                        </p>

                    )}

                </div>

            </td>


            {/* ==========================================
                PROJECT
            ========================================== */}

            <td className="px-6 py-4">

                <button
                    onClick={() =>
                        navigate(
                            `/team/${task.team_id}/project/${task.project_id}`
                        )
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-blue-600
                        hover:text-blue-700
                    "
                >

                    <FolderKanban
                        size={16}
                    />

                    <span className="truncate max-w-[150px]">
                        {
                            task.project_name ||
                            "Unknown"
                        }
                    </span>

                </button>

            </td>


            {/* ==========================================
                ASSIGNEE
            ========================================== */}

            <td className="px-6 py-4">

                <div className="flex items-center gap-2">

                    <div
                        className="
                            w-7
                            h-7
                            rounded-full
                            bg-slate-100
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-semibold
                            text-slate-600
                            shrink-0
                        "
                    >

                        {
                            (
                                task.assigned_to_name ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()
                        }

                    </div>


                    <span className="text-sm text-slate-600 truncate max-w-[120px]">

                        {
                            task.assigned_to_name ||
                            "Unassigned"
                        }

                    </span>

                </div>

            </td>


            {/* ==========================================
                PRIORITY
            ========================================== */}

            <td className="px-6 py-4">

                <span
                    className={`
                        text-sm
                        font-medium
                        ${priorityClass[
                        task.priority
                        ] ||
                        "text-slate-500"
                        }
                    `}
                >

                    {
                        task.priority ||
                        "Medium"
                    }

                </span>

            </td>


            {/* ==========================================
                DUE DATE
            ========================================== */}

            <td className="px-6 py-4">

                <div
                    className={`
                        flex
                        items-center
                        gap-2
                        text-sm
                        ${overdue
                            ? "text-red-600 font-medium"
                            : today
                                ? "text-blue-600 font-medium"
                                : "text-slate-500"
                        }
                    `}
                >

                    <Calendar
                        size={15}
                    />

                    <span>
                        {
                            getDueDateLabel()
                        }
                    </span>

                </div>

            </td>


            {/* ==========================================
                STATUS
            ========================================== */}

            <td className="px-6 py-4">

                <select
                    value={
                        task.status ||
                        "Todo"
                    }
                    disabled={
                        updating
                    }
                    onChange={e =>
                        onStatusChange(
                            task,
                            e.target.value
                        )
                    }
                    className={`
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-medium
                        border-0
                        outline-none
                        cursor-pointer
                        ${statusClass[
                        task.status
                        ] ||
                        statusClass.Todo
                        }
                        ${updating
                            ? "opacity-50"
                            : ""
                        }
                    `}
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

            </td>


            {/* ==========================================
                ACTIONS
            ========================================== */}

            <td className="px-6 py-4">

                <div
                    className="
                        flex
                        items-center
                        justify-end
                        gap-2
                    "
                >

                    {/* EDIT */}

                    <button
                        title="Edit task"
                        onClick={() =>
                            onEdit(task)
                        }
                        className="
                            p-2
                            rounded-lg
                            text-slate-500
                            hover:bg-slate-100
                            hover:text-blue-600
                            transition
                        "
                    >

                        <Pencil
                            size={17}
                        />

                    </button>


                    {/* DELETE */}

                    <button
                        title="Delete task"
                        disabled={
                            deleting
                        }
                        onClick={() =>
                            onDelete(task)
                        }
                        className="
                            p-2
                            rounded-lg
                            text-slate-500
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:opacity-50
                            transition
                        "
                    >

                        <Trash2
                            size={17}
                        />

                    </button>

                </div>

            </td>

        </tr>

    );

}