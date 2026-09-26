import {
    FolderOpen,
    Plus,
    ArrowRight,
    Trash2,
    Pencil
} from "lucide-react";

export default function ProjectsCard({
    projects = [],
    loading = false,
    onCreateProject,
    onProjectClick,
    onDeleteProject,
    onEditProject,
    currentUserRole,
    deletingProjectId = null,
    editingProjectId = null
}) {

    const visibleProjects =
        projects.slice(0, 4);


    const canManageProject =
        currentUserRole === "Owner" ||
        currentUserRole === "Admin";


    return (

        <div className="bg-white rounded-2xl shadow-sm border">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex justify-between items-center p-5 border-b">

                <div>

                    <h2 className="font-bold tracking-widest text-sm uppercase">
                       My Projects
                    </h2>

                    {!loading && (

                        <p className="text-xs text-slate-500 mt-1">

                            {projects.length} project
                            {projects.length !== 1 ? "s" : ""}

                        </p>

                    )}

                </div>


                {projects.length > 0 && (

                    <button
                        type="button"
                        className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                    >

                        View All

                        <ArrowRight size={15} />

                    </button>

                )}

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="h-64 flex items-center justify-center">

                    <div className="text-center">

                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                        <p className="text-slate-500 text-sm mt-3">

                            Loading projects...

                        </p>

                    </div>

                </div>

            )}


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!loading && projects.length === 0 && (

                <div className="h-64 flex flex-col items-center justify-center px-6">

                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">

                        <FolderOpen
                            size={32}
                            className="text-slate-400"
                        />

                    </div>


                    <h3 className="mt-4 text-xl font-semibold">

                        No projects yet

                    </h3>


                    <p className="mt-2 text-slate-500 text-sm text-center">

                        Create your first project to start organizing your work.

                    </p>


                    <button
                        type="button"
                        onClick={onCreateProject}
                        className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                    >

                        <Plus size={18} />

                        Create Project

                    </button>

                </div>

            )}


            {/* ==================================================
                PROJECTS
            ================================================== */}

            {!loading && projects.length > 0 && (

                <div className="p-5 space-y-3">

                    {visibleProjects.map((project) => {

                        const isDeleting =
                            String(deletingProjectId) ===
                            String(project.id);


                        const isEditing =
                            String(editingProjectId) ===
                            String(project.id);


                        return (

                            <div
                                key={project.id}
                                className="group flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 hover:border-blue-200 transition"
                            >

                                {/* ==================================================
                                    PROJECT INFO
                                ================================================== */}

                                <div
                                    onClick={() =>
                                        onProjectClick?.(project)
                                    }
                                    className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                                >

                                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">

                                        <FolderOpen
                                            size={21}
                                            className="text-blue-600"
                                        />

                                    </div>


                                    <div className="min-w-0">

                                        <h3 className="font-semibold truncate">

                                            {project.name}

                                        </h3>


                                        <p className="text-sm text-slate-500 truncate max-w-md">

                                            {project.description ||
                                                "No description"}

                                        </p>

                                    </div>

                                </div>


                                {/* ==================================================
                                    STATUS + CONTROLS
                                ================================================== */}

                                <div className="flex items-center gap-2 ml-4">


                                    {/* STATUS */}

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                            project.status === "Completed"
                                                ? "bg-green-100 text-green-700"
                                                : project.status === "Planning"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-blue-100 text-blue-700"
                                        }`}
                                    >

                                        {project.status || "Active"}

                                    </span>


                                    {/* ==================================================
                                        EDIT
                                    ================================================== */}

                                    {canManageProject && (

                                        <button
                                            type="button"
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                onEditProject?.(
                                                    project
                                                );

                                            }}
                                            disabled={
                                                isEditing ||
                                                isDeleting
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
                                            title="Edit project"
                                        >

                                            {isEditing ? (

                                                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

                                            ) : (

                                                <Pencil size={15} />

                                            )}

                                        </button>

                                    )}


                                    {/* ==================================================
                                        DELETE
                                    ================================================== */}

                                    {canManageProject && (

                                        <button
                                            type="button"
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                onDeleteProject?.(
                                                    project
                                                );

                                            }}
                                            disabled={
                                                isDeleting ||
                                                isEditing
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                            title="Delete project"
                                        >

                                            {isDeleting ? (

                                                <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />

                                            ) : (

                                                <Trash2 size={16} />

                                            )}

                                        </button>

                                    )}


                                    {/* ==================================================
                                        OPEN PROJECT
                                    ================================================== */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onProjectClick?.(project)
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-lg"
                                        title="Open project"
                                    >

                                        <ArrowRight
                                            size={18}
                                            className="text-slate-300 group-hover:text-blue-600 transition"
                                        />

                                    </button>

                                </div>

                            </div>

                        );

                    })}


                    {/* ==================================================
                        MORE PROJECTS
                    ================================================== */}

                    {projects.length > 4 && (

                        <button
                            type="button"
                            className="w-full py-3 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition"
                        >

                            View {projects.length - 4} more project
                            {projects.length - 4 !== 1 ? "s" : ""}

                            <ArrowRight
                                size={15}
                                className="inline ml-1"
                            />

                        </button>

                    )}


                    {/* ==================================================
                        CREATE PROJECT
                    ================================================== */}

                    <button
                        type="button"
                        onClick={onCreateProject}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition"
                    >

                        <Plus size={18} />

                        Create Project

                    </button>

                </div>

            )}

        </div>

    );

}