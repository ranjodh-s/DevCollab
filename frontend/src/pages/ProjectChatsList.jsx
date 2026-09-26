import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    MessageCircle,
    Search,
    FolderKanban,
    ArrowRight,
    Loader2
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { getMyProjectChats } from "../api/project";


export default function ProjectChats() {

    const {
        teamId
    } = useParams();

    const navigate =
        useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [
        projects,
        setProjects
    ] = useState([]);

    const [
        search,
        setSearch
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState(null);


    // ==========================================
    // FETCH PROJECT CHATS
    // ==========================================

    useEffect(() => {

        const fetchProjectChats =
            async () => {

                try {

                    setLoading(true);
                    setError(null);

                    const response =
                        await getMyProjectChats(
                            teamId
                        );

                    setProjects(
                        response.projects || []
                    );

                } catch (error) {

                    console.error(
                        "Failed to load project chats:",
                        error
                    );

                    setError(
                        error.response?.data?.message ||
                        "Failed to load project chats"
                    );

                } finally {

                    setLoading(false);

                }

            };


        if (teamId) {
            fetchProjectChats();
        }

    }, [teamId]);


    // ==========================================
    // FILTER PROJECTS
    // ==========================================

    const filteredProjects =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return projects;
            }

            return projects.filter(
                (project) =>
                    project.name
                        ?.toLowerCase()
                        .includes(query) ||

                    project.description
                        ?.toLowerCase()
                        .includes(query)
            );

        }, [
            projects,
            search
        ]);


    // ==========================================
    // OPEN CHAT
    // ==========================================

    const openChat = (
        projectId
    ) => {

        navigate(
            `/team/${teamId}/project/${projectId}/chat`
        );

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="flex min-h-[500px] items-center justify-center">

                <Loader2
                    size={28}
                    className="animate-spin text-slate-400"
                />

            </div>

        );

    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="space-y-6">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div>

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">

                        <MessageCircle
                            size={21}
                        />

                    </div>

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Project Chats
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Conversations from projects you are a member of
                        </p>

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                    {error}

                </div>

            )}


            {/* ================================= */}
            {/* SEARCH */}
            {/* ================================= */}

            <div className="relative">

                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search project chats..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

            </div>


            {/* ================================= */}
            {/* PROJECT COUNT */}
            {/* ================================= */}

            <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">

                    {filteredProjects.length}

                    {" "}

                    {filteredProjects.length === 1
                        ? "project"
                        : "projects"}

                </p>

            </div>


            {/* ================================= */}
            {/* EMPTY STATE */}
            {/* ================================= */}

            {filteredProjects.length === 0 ? (

                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                        <MessageCircle
                            size={25}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="font-semibold text-slate-800">

                        {search
                            ? "No projects found"
                            : "No project chats"}

                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">

                        {search
                            ? "Try searching for another project."
                            : "You are not currently a member of any projects in this team."}

                    </p>

                </div>

            ) : (

                /* ================================= */
                /* PROJECT LIST */
                /* ================================= */

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {filteredProjects.map(
                        (project) => (

                            <ProjectChatCard
                                key={project.id}
                                project={project}
                                onOpen={() =>
                                    openChat(
                                        project.id
                                    )
                                }
                            />

                        )
                    )}

                </div>

            )}

        </div>

    );

}


// ======================================================
// PROJECT CHAT CARD
// ======================================================

function ProjectChatCard({
    project,
    onOpen
}) {

    return (

        <button
            type="button"
            onClick={onOpen}
            className="group w-full text-left"
        >

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">

                {/* TOP */}

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">

                            <FolderKanban
                                size={20}
                            />

                        </div>


                        <div className="min-w-0">

                            <h2 className="truncate font-semibold text-slate-900">

                                {project.name}

                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">

                                {project.role}

                            </p>

                        </div>

                    </div>


                    <ArrowRight
                        size={18}
                        className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
                    />

                </div>


                {/* DESCRIPTION */}

                <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">

                    {project.description ||
                        "No project description available."}

                </p>


                {/* BOTTOM */}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                        <MessageCircle
                            size={15}
                        />

                        Project Chat

                    </div>


                    <span className="text-xs font-semibold text-slate-700">

                        Open Chat

                    </span>

                </div>

            </div>

        </button>

    );

}