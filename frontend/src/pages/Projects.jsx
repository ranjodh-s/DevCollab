import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../store/authStore";

import {
    getMyProjectChats,
    createProject,
    updateProject,
    deleteProject
} from "../api/project";

import {
    getTeamMembers
} from "../api/team";

import ProjectsCard from "../components/projects/ProjectsCard";

import CreateProjectModal from "../components/projects/CreateProjectModal";
import EditProjectModal from "../components/projects/EditProjectModal";


export default function Projects() {

    const navigate = useNavigate();

    const { teamId } = useParams();

    const user = useAuthStore(
        state => state.user
    );


    // ======================================================
    // PROJECTS
    // ======================================================

    const [projects, setProjects] = useState([]);

    const [loadingProjects, setLoadingProjects] =
        useState(true);


    // ======================================================
    // MEMBERS
    // ======================================================

    const [members, setMembers] = useState([]);

    const [loadingMembers, setLoadingMembers] =
        useState(true);


    // ======================================================
    // CREATE PROJECT MODAL
    // ======================================================

    const [showProjectModal, setShowProjectModal] =
        useState(false);


    // ======================================================
    // EDIT PROJECT MODAL
    // ======================================================

    const [showEditProjectModal, setShowEditProjectModal] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState(null);


    // ======================================================
    // DELETE PROJECT
    // ======================================================

    const [deletingProjectId, setDeletingProjectId] =
        useState(null);


    // ======================================================
    // LOAD USER'S PROJECTS
    // ======================================================

    const fetchProjects = async () => {

        try {

            setLoadingProjects(true);

            /*
             * This endpoint returns ONLY projects
             * where the current user is a member.
             */
            const response =
                await getMyProjectChats(teamId);


            const projectList =
                response?.projects ||
                response?.data?.projects ||
                response?.data ||
                response ||
                [];


            setProjects(
                Array.isArray(projectList)
                    ? projectList
                    : []
            );

        } catch (err) {

            console.error(
                "FETCH PROJECTS ERROR:",
                err
            );

            setProjects([]);

            toast.error(
                err?.response?.data?.message ||
                "Failed to load projects."
            );

        } finally {

            setLoadingProjects(false);

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

        } catch (err) {

            console.error(
                "FETCH MEMBERS ERROR:",
                err
            );

            setMembers([]);

            toast.error(
                err?.response?.data?.message ||
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


        fetchProjects();

        fetchMembers();

    }, [teamId]);


    // ======================================================
    // CURRENT USER
    // ======================================================

    const currentUser =
        members.find(
            member =>
                String(
                    member.id ??
                    member.user_id
                ) ===
                String(user?.id)
        );


    // ======================================================
    // CURRENT USER TEAM ROLE
    // ======================================================

    const currentUserRole =
        currentUser?.role ||
        "Member";


    // ======================================================
    // CREATE PROJECT
    // ======================================================

    const handleCreateProject = async (data) => {

        try {

            await createProject({

                teamId:
                    Number(teamId),

                name:
                    data.name,

                description:
                    data.description

            });


            toast.success(
                "Project created successfully!"
            );


            setShowProjectModal(false);


            await fetchProjects();

        } catch (err) {

            console.error(
                "CREATE PROJECT ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                "Failed to create project."
            );


            throw err;

        }

    };


    // ======================================================
    // OPEN EDIT PROJECT
    // ======================================================

    const handleEditProject = (project) => {

        if (!project) {
            return;
        }


        setEditingProject(project);

        setShowEditProjectModal(true);

    };


    // ======================================================
    // UPDATE PROJECT
    // ======================================================

    const handleUpdateProject = async (data) => {

        if (!editingProject) {
            return;
        }


        try {

            await updateProject(
                Number(editingProject.id),
                {
                    name:
                        data.name,

                    description:
                        data.description
                }
            );


            toast.success(
                "Project updated successfully!"
            );


            setShowEditProjectModal(false);

            setEditingProject(null);


            await fetchProjects();

        } catch (err) {

            console.error(
                "UPDATE PROJECT ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update project."
            );


            throw err;

        }

    };


    // ======================================================
    // DELETE PROJECT
    // ======================================================

    const handleDeleteProject = async (project) => {

        if (!project) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${project.name}"? This action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingProjectId(
                project.id
            );


            await deleteProject(
                Number(project.id)
            );


            toast.success(
                "Project deleted successfully!"
            );


            await fetchProjects();

        } catch (err) {

            console.error(
                "DELETE PROJECT ERROR:",
                err
            );


            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete project."
            );

        } finally {

            setDeletingProjectId(null);

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (
        loadingProjects &&
        loadingMembers
    ) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-slate-50">

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
                        Loading projects...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="p-8 bg-slate-50 min-h-screen">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="mb-8">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Projects
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Manage and access your projects.
                        </p>

                    </div>

                </div>

            </div>


            {/* ==========================================
                PROJECTS
            ========================================== */}

            <ProjectsCard

                projects={
                    projects
                }

                loading={
                    loadingProjects
                }

                onCreateProject={() =>
                    setShowProjectModal(true)
                }

                onProjectClick={(project) =>
                    navigate(
                        `/team/${teamId}/project/${project.id}`
                    )
                }

                onEditProject={
                    handleEditProject
                }

                onDeleteProject={
                    handleDeleteProject
                }

                currentUserRole={
                    currentUserRole
                }

                deletingProjectId={
                    deletingProjectId
                }

            />


            {/* ==========================================
                CREATE PROJECT MODAL
            ========================================== */}

            <CreateProjectModal

                open={
                    showProjectModal
                }

                onClose={() =>
                    setShowProjectModal(false)
                }

                onCreate={
                    handleCreateProject
                }

            />


            {/* ==========================================
                EDIT PROJECT MODAL
            ========================================== */}

            <EditProjectModal

                open={
                    showEditProjectModal
                }

                onClose={() => {

                    setShowEditProjectModal(false);

                    setEditingProject(null);

                }}

                project={
                    editingProject
                }

                onUpdate={
                    handleUpdateProject
                }

            />

        </div>

    );

}