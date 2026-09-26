import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    FolderOpen,
    CheckCircle2,
    Clock3,
    ListTodo,
    Plus,
    Circle,
    Flag,
    CalendarDays,
    UserRound,
    Users
} from "lucide-react";

import { getProjectsByTeam } from "../api/project";

import {
    createTask,
    getTasksByProject,
    updateTaskById,
    deleteTaskById
} from "../api/task";

import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import EditTaskModal from "../components/tasks/EditTaskModal";

import ProjectMembersModal from "../components/projects/ProjectMembersModal";
import ProjectChat from "../components/chat/projectChat"


// ======================================================
// GET TASK STATUS
// ======================================================

const getTaskStatus = (task) => {

    if (!task) {
        return "Todo";
    }

    const possibleStatus =
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
        task.status_value;

    if (
        possibleStatus &&
        typeof possibleStatus === "object"
    ) {

        return (
            possibleStatus.name ??
            possibleStatus.label ??
            possibleStatus.status ??
            possibleStatus.value ??
            "Todo"
        );
    }

    if (
        possibleStatus !== undefined &&
        possibleStatus !== null &&
        String(possibleStatus).trim() !== ""
    ) {

        return String(possibleStatus);
    }

    return "Todo";
};


// ======================================================
// NORMALIZE STATUS FOR UI
// ======================================================

const formatTaskStatus = (status) => {

    if (!status) {
        return "Todo";
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


    return String(status);
};


// ======================================================
// CONVERT STATUS TO BACKEND FORMAT
// ======================================================

const toBackendStatus = (status) => {

    const normalized =
        formatTaskStatus(status);


    switch (normalized) {

        case "Todo":
            return "Todo";

        case "In Progress":
            return "In Progress";

        case "Review":
            return "Review";

        case "Completed":
            return "Completed";

        case "Cancelled":
            // Backend currently doesn't support Cancelled.
            return "Todo";

        default:
            return "Todo";
    }
};


// ======================================================
// COMPONENT
// ======================================================

export default function ProjectDetails() {

    const [showProjectMembersModal, setShowProjectMembersModal] =
        useState(false);

    const {
        teamId,
        projectId
    } = useParams();

    const navigate = useNavigate();


    // ======================================================
    // PROJECT
    // ======================================================

    const [project, setProject] =
        useState(null);

    const [loadingProject, setLoadingProject] =
        useState(true);


    // ======================================================
    // TASKS
    // ======================================================

    const [tasks, setTasks] =
        useState([]);

    const [loadingTasks, setLoadingTasks] =
        useState(true);


    // ======================================================
    // CREATE TASK
    // ======================================================

    const [showTaskModal, setShowTaskModal] =
        useState(false);


    // ======================================================
    // DETAILS
    // ======================================================

    const [selectedTask, setSelectedTask] =
        useState(null);


    // ======================================================
    // EDIT
    // ======================================================

    const [editingTask, setEditingTask] =
        useState(null);

    const [showEditTaskModal, setShowEditTaskModal] =
        useState(false);

    const [deletingTask, setDeletingTask] = useState(false);


    // ======================================================
    // LOAD PROJECT
    // ======================================================

    const fetchProject = async () => {

        try {

            setLoadingProject(true);


            const response =
                await getProjectsByTeam(teamId);


            const projects =
                response?.projects ||
                response?.data?.projects ||
                response?.data ||
                response ||
                [];


            const foundProject =
                Array.isArray(projects)
                    ? projects.find(
                        item =>
                            String(item.id) ===
                            String(projectId)
                    )
                    : null;


            if (!foundProject) {

                toast.error(
                    "Project not found"
                );

                navigate(
                    `/team/${teamId}`
                );

                return;
            }


            setProject(
                foundProject
            );

        } catch (err) {

            console.error(
                "FETCH PROJECT ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to load project."
            );

        } finally {

            setLoadingProject(false);

        }
    };


    // ======================================================
    // LOAD TASKS
    // ======================================================

    const fetchTasks = async () => {

        try {

            setLoadingTasks(true);


            const response =
                await getTasksByProject(
                    projectId
                );


            console.log(
                "TASK API RESPONSE:",
                response
            );


            const taskList =
                response?.tasks ||
                response?.data?.tasks ||
                response?.data ||
                response ||
                [];


            const finalTasks =
                Array.isArray(taskList)
                    ? taskList
                    : [];


            console.log(
                "TASKS:",
                finalTasks
            );


            setTasks(
                finalTasks
            );

        } catch (err) {

            console.error(
                "FETCH TASKS ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to load tasks."
            );

        } finally {

            setLoadingTasks(false);

        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        if (
            !teamId ||
            !projectId
        ) {

            return;
        }


        fetchProject();

        fetchTasks();

    }, [
        teamId,
        projectId
    ]);


    // ======================================================
    // CREATE TASK
    // ======================================================

    const handleCreateTask = async (data) => {

        try {

            const newTaskData = {

                projectId:
                    Number(projectId),

                title:
                    data.title?.trim(),

                description:
                    data.description?.trim() ||
                    "",

                priority:
                    data.priority ||
                    "Medium",

                dueDate:
                    data.dueDate ||
                    null
            };


            console.log(
                "CREATING TASK:",
                newTaskData
            );


            await createTask(
                newTaskData
            );


            toast.success(
                "Task created successfully!"
            );


            setShowTaskModal(
                false
            );


            await fetchTasks();

        } catch (err) {

            console.error(
                "CREATE TASK ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to create task."
            );


            throw err;
        }
    };


    // ======================================================
    // OPEN TASK DETAILS
    // ======================================================

    const handleOpenTask = (task) => {

        setSelectedTask({

            ...task,

            status:
                formatTaskStatus(
                    getTaskStatus(task)
                )
        });
    };


    // ======================================================
    // OPEN EDIT
    // ======================================================

    const handleEditTask = (task) => {

        if (!task) {
            return;
        }


        setSelectedTask(
            null
        );


        setEditingTask({

            ...task,

            status:
                formatTaskStatus(
                    getTaskStatus(task)
                )
        });


        setShowEditTaskModal(
            true
        );
    };


    // ======================================================
    // SAVE EDITED TASK
    // ======================================================

    const handleSaveTask = async (data) => {

        if (!editingTask?.id) {

            toast.error(
                "Task ID is missing."
            );

            return;
        }


        try {

            const taskId =
                editingTask.id;


            const backendStatus =
                toBackendStatus(
                    data.status
                );


            const updateData = {

                title:
                    data.title?.trim(),

                description:
                    data.description?.trim() ||
                    "",

                priority:
                    data.priority ||
                    "Medium",

                status:
                    backendStatus,

                assignedTo:
                    data.assignedTo
                        ? Number(
                            data.assignedTo
                        )
                        : null,

                dueDate:
                    data.dueDate ||
                    null
            };


            console.log(
                "================================"
            );


            console.log(
                "UPDATING TASK:",
                taskId
            );


            console.log(
                "FULL UPDATE DATA:",
                updateData
            );


            console.log(
                "ASSIGNED TO:",
                updateData.assignedTo
            );


            console.log(
                "STATUS:",
                updateData.status
            );


            console.log(
                "================================"
            );


            await updateTaskById(
                taskId,
                updateData
            );


            await fetchTasks();


            toast.success(
                "Task updated successfully!"
            );


            setShowEditTaskModal(
                false
            );


            setEditingTask(
                null
            );


            setSelectedTask(
                null
            );

        } catch (err) {

            console.error(
                "================================"
            );


            console.error(
                "UPDATE TASK ERROR:",
                err
            );


            console.error(
                "RESPONSE:",
                err?.response
            );


            console.error(
                "RESPONSE DATA:",
                err?.response?.data
            );


            console.error(
                "================================"
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to update task."
            );


            throw err;
        }
    };

    const handleDeleteTask = async (task) => {

        if (!task?.id) {
            toast.error("Task ID is missing.");
            return;
        }

        try {

            setDeletingTask(true);

            await deleteTaskById(task.id);

            toast.success(
                "Task deleted successfully!"
            );

            setSelectedTask(null);

            await fetchTasks();

        } catch (err) {

            console.error(
                "DELETE TASK ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to delete task."
            );

            throw err;

        } finally {

            setDeletingTask(false);

        }
    };


    // ======================================================
    // CLOSE EDIT
    // ======================================================

    const handleCloseEdit = () => {

        setShowEditTaskModal(
            false
        );


        setEditingTask(
            null
        );
    };


    // ======================================================
    // LOADING PROJECT
    // ======================================================

    if (loadingProject) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-3 text-slate-500">
                        Loading project...
                    </p>

                </div>

            </div>
        );
    }


    if (!project) {
        return null;
    }


    // ======================================================
    // PROJECT STATUS
    // ======================================================

    const projectStatus =
        project.status ||
        "Active";


    const isProjectCompleted =
        String(projectStatus)
            .toLowerCase() ===
        "completed";


    // ======================================================
    // TASK STATS
    // ======================================================

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(task => {

            const status =
                formatTaskStatus(
                    getTaskStatus(task)
                );

            return status ===
                "Completed";

        }).length;


    const inProgressTasks =
        tasks.filter(task => {

            const status =
                formatTaskStatus(
                    getTaskStatus(task)
                );

            return status ===
                "In Progress";

        }).length;


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="min-h-screen bg-slate-50 p-8">

            <div className="max-w-6xl mx-auto">


                {/* ==================================================
                    BACK
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/team/${teamId}`
                        )
                    }
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-8"
                >

                    <ArrowLeft
                        size={18}
                    />

                    Back to Workspace

                </button>


                {/* ==================================================
                    PROJECT HEADER
                ================================================== */}

                <div className="bg-white rounded-2xl border shadow-sm p-7">

                    <div className="flex items-start justify-between gap-6">

                        <div className="flex items-start gap-5">

                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">

                                <FolderOpen
                                    size={30}
                                    className="text-blue-600"
                                />

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Project
                                </p>


                                <h1 className="text-4xl font-bold mt-1">
                                    {project.name}
                                </h1>


                                <p className="mt-2 text-slate-500">
                                    {project.description ||
                                        "No description"}
                                </p>

                            </div>

                        </div>


                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowProjectMembersModal(true)
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition"
                            >

                                <Users size={17} />

                                Members

                            </button>


                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${isProjectCompleted
                                    ? "bg-green-100 text-green-700"
                                    : projectStatus === "Planning"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                            >

                                {projectStatus}

                            </span>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    TASK STATS
                ================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">


                    {/* TOTAL */}

                    <div className="bg-white border rounded-2xl p-5">

                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                            <ListTodo
                                size={22}
                                className="text-blue-600"
                            />

                        </div>


                        <p className="text-2xl font-bold mt-4">
                            {totalTasks}
                        </p>


                        <p className="text-sm text-slate-500">
                            Total Tasks
                        </p>

                    </div>


                    {/* COMPLETED */}

                    <div className="bg-white border rounded-2xl p-5">

                        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">

                            <CheckCircle2
                                size={22}
                                className="text-green-600"
                            />

                        </div>


                        <p className="text-2xl font-bold mt-4">
                            {completedTasks}
                        </p>


                        <p className="text-sm text-slate-500">
                            Completed
                        </p>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="bg-white border rounded-2xl p-5">

                        <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">

                            <Clock3
                                size={22}
                                className="text-yellow-600"
                            />

                        </div>


                        <p className="text-2xl font-bold mt-4">
                            {inProgressTasks}
                        </p>


                        <p className="text-sm text-slate-500">
                            In Progress
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    TASKS
                ================================================== */}

                <div className="bg-white border rounded-2xl shadow-sm mt-6">


                    {/* HEADER */}

                    <div className="flex items-center justify-between p-5 border-b">

                        <div>

                            <h2 className="font-bold tracking-widest text-sm uppercase">
                                Tasks
                            </h2>


                            <p className="text-sm text-slate-500 mt-1">
                                Manage tasks for this project
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setShowTaskModal(
                                    true
                                )
                            }
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
                        >

                            <Plus
                                size={18}
                            />

                            Create Task

                        </button>

                    </div>


                    {/* ==================================================
                        LOADING
                    ================================================== */}

                    {loadingTasks && (

                        <div className="h-64 flex flex-col items-center justify-center">

                            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />


                            <p className="mt-3 text-sm text-slate-500">
                                Loading tasks...
                            </p>

                        </div>
                    )}


                    {/* ==================================================
                        EMPTY
                    ================================================== */}

                    {!loadingTasks &&
                        tasks.length === 0 && (

                            <div className="h-64 flex flex-col items-center justify-center">

                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">

                                    <ListTodo
                                        size={27}
                                        className="text-slate-400"
                                    />

                                </div>


                                <h3 className="mt-4 font-semibold text-lg">
                                    No tasks yet
                                </h3>


                                <p className="text-sm text-slate-500 mt-1">
                                    Create a task to start working on this project.
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowTaskModal(
                                            true
                                        )
                                    }
                                    className="mt-5 flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                                >

                                    <Plus
                                        size={17}
                                    />

                                    Create your first task

                                </button>

                            </div>
                        )}


                    {/* ==================================================
                        TASK LIST
                    ================================================== */}

                    {!loadingTasks &&
                        tasks.length > 0 && (

                            <div className="p-5 space-y-3">

                                {tasks.map(task => {

                                    // ----------------------------------
                                    // STATUS
                                    // ----------------------------------

                                    const taskStatus =
                                        formatTaskStatus(
                                            getTaskStatus(task)
                                        );


                                    // ----------------------------------
                                    // PRIORITY
                                    // ----------------------------------

                                    const taskPriority =
                                        task.priority ||
                                        "Medium";


                                    // ----------------------------------
                                    // STATUS FLAGS
                                    // ----------------------------------

                                    const completed =
                                        taskStatus ===
                                        "Completed";


                                    const inProgress =
                                        taskStatus ===
                                        "In Progress";


                                    const review =
                                        taskStatus ===
                                        "Review";


                                    // ----------------------------------
                                    // DUE DATE
                                    // ----------------------------------

                                    const dueDate =
                                        task.dueDate ||
                                        task.due_date ||
                                        "";


                                    // ----------------------------------
                                    // ASSIGNED MEMBER
                                    //
                                    // Backend returns:
                                    //
                                    // assigned_to
                                    // assigned_to_name
                                    //
                                    // ----------------------------------

                                    const assignedToName =
                                        task.assigned_to_name ||
                                        task.assignedToName ||
                                        "";


                                    return (

                                        <div
                                            key={task.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                handleOpenTask(
                                                    task
                                                )
                                            }
                                            onKeyDown={(e) => {

                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {

                                                    e.preventDefault();

                                                    handleOpenTask(
                                                        task
                                                    );
                                                }

                                            }}
                                            className="w-full cursor-pointer text-left flex items-center justify-between gap-4 p-4 border rounded-xl hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm transition group focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >


                                            {/* ==================================================
                                                LEFT
                                            ================================================== */}

                                            <div className="flex items-center gap-4 min-w-0">

                                                <div
                                                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${completed
                                                        ? "bg-green-100"
                                                        : inProgress
                                                            ? "bg-yellow-100"
                                                            : review
                                                                ? "bg-purple-100"
                                                                : "bg-blue-100"
                                                        }`}
                                                >

                                                    {completed ? (

                                                        <CheckCircle2
                                                            size={21}
                                                            className="text-green-600"
                                                        />

                                                    ) : (

                                                        <Circle
                                                            size={21}
                                                            className={
                                                                inProgress
                                                                    ? "text-yellow-600"
                                                                    : review
                                                                        ? "text-purple-600"
                                                                        : "text-blue-600"
                                                            }
                                                        />

                                                    )}

                                                </div>


                                                <div className="min-w-0">

                                                    <h3 className="font-semibold truncate">

                                                        {task.title ||
                                                            task.name ||
                                                            "Untitled Task"}

                                                    </h3>


                                                    <p className="text-sm text-slate-500 truncate">

                                                        {task.description ||
                                                            "No description"}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* ==================================================
                                                RIGHT
                                            ================================================== */}

                                            <div className="flex items-center gap-3 shrink-0">


                                                {/* ==================================================
                                                    PRIORITY
                                                ================================================== */}

                                                <span
                                                    className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${taskPriority === "Urgent"
                                                        ? "bg-red-100 text-red-700"
                                                        : taskPriority === "High"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : taskPriority === "Low"
                                                                ? "bg-slate-100 text-slate-600"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >

                                                    <Flag
                                                        size={12}
                                                        className="mr-1"
                                                    />

                                                    {taskPriority}

                                                </span>


                                                {/* ==================================================
                                                    STATUS
                                                ================================================== */}

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${completed
                                                        ? "bg-green-100 text-green-700"
                                                        : inProgress
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : review
                                                                ? "bg-purple-100 text-purple-700"
                                                                : taskStatus === "Cancelled"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >

                                                    {taskStatus}

                                                </span>


                                                {/* ==================================================
                                                    ASSIGNED MEMBER
                                                ================================================== */}

                                                {assignedToName && (

                                                    <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">

                                                        <UserRound
                                                            size={14}
                                                            className="text-slate-400 shrink-0"
                                                        />


                                                        <span className="max-w-[130px] truncate">

                                                            {assignedToName}

                                                        </span>

                                                    </span>

                                                )}


                                                {/* ==================================================
                                                    DUE DATE
                                                ================================================== */}

                                                {dueDate && (

                                                    <span className="hidden md:flex items-center gap-1 text-xs text-slate-400">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {dueDate}

                                                    </span>

                                                )}

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>
                        )}

                </div>

            </div>


            {/* ==================================================
                CREATE TASK MODAL
            ================================================== */}

            <CreateTaskModal
                open={showTaskModal}
                onClose={() =>
                    setShowTaskModal(
                        false
                    )
                }
                onCreate={handleCreateTask}
            />


            {/* ==================================================
                TASK DETAILS MODAL
            ================================================== */}

            <TaskDetailsModal
                task={selectedTask}
                onClose={() =>
                    setSelectedTask(null)
                }
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                deletingTask={deletingTask}
            />


            {/* ==================================================
                EDIT TASK MODAL
            ================================================== */}

            <EditTaskModal
                open={
                    showEditTaskModal
                }
                task={
                    editingTask
                }
                teamId={
                    teamId
                }
                onClose={
                    handleCloseEdit
                }
                onSave={
                    handleSaveTask
                }
            />

            <ProjectMembersModal
                open={showProjectMembersModal}
                onClose={() =>
                    setShowProjectMembersModal(false)
                }
                projectId={projectId}
                teamId={teamId}
            />

            <div className="mt-6">

                <ProjectChat
                    projectId={projectId}
                />

            </div>

        </div>
    );
}