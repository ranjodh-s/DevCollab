import { useEffect, useState } from "react";
import {
    useParams,
    useNavigate
} from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../store/authStore";

import {
    getMyProjectChats,
    createProject,
    updateProject,
    deleteProject,
    
} from "../api/project";

import {
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    makeMemberAdmin,
    removeAdminRole
} from "../api/team";

import {
    getTeamActivity
} from "../api/activity";

import TeamActivityCard from "../components/dashboard/TeamActivityCard";

import CreateProjectModal from "../components/projects/CreateProjectModal";
import EditProjectModal from "../components/projects/EditProjectModal";
import AddTeamMemberModal from "../components/teams/AddTeamMemberModal";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import ProjectsCard from "../components/projects/ProjectsCard";
import TeamMembersCard from "../components/dashboard/TeamMembersCard";
import QuickLinks from "../components/dashboard/QuickLinks";
import ConfirmActionModal from "../components/common/ConfirmActionModal";


export default function Dashboard() {

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
    // ACTIVITIES
    // ======================================================

    const [activities, setActivities] = useState([]);

    const [loadingActivities, setLoadingActivities] =
        useState(true);


    // ======================================================
    // EDIT PROJECT
    // ======================================================

    const [showEditProjectModal, setShowEditProjectModal] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState(null);


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
    // ADD MEMBER MODAL
    // ======================================================

    const [showAddMemberModal, setShowAddMemberModal] =
        useState(false);

    const [addingMember, setAddingMember] =
        useState(false);


    // ======================================================
    // MEMBER ACTIONS
    // ======================================================

    const [updatingUserId, setUpdatingUserId] =
        useState(null);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const [confirmLoading, setConfirmLoading] =
        useState(false);


    // ======================================================
    // DELETE PROJECT
    // ======================================================

    const [deletingProjectId, setDeletingProjectId] =
        useState(null);


    // ======================================================
    // LOAD PROJECTS
    // ======================================================

    const fetchProjects = async () => {

        try {

            setLoadingProjects(true);

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

            console.log(
                "TEAM MEMBERS RESPONSE:",
                response
            );

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
    // LOAD TEAM ACTIVITIES
    // ======================================================

    const fetchActivities = async () => {

        try {

            setLoadingActivities(true);

            const response =
                await getTeamActivity(teamId);

            console.log(
                "TEAM ACTIVITY RESPONSE:",
                response
            );

            const activityList =
                response?.activities ||
                response?.data?.activities ||
                response?.data ||
                response ||
                [];

            setActivities(
                Array.isArray(activityList)
                    ? activityList
                    : []
            );

        } catch (err) {

            console.error(
                "FETCH TEAM ACTIVITY ERROR:",
                err
            );

            setActivities([]);

        } finally {

            setLoadingActivities(false);

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
        fetchActivities();

    }, [teamId]);


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

            await fetchActivities();

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
    // OPEN ADD MEMBER MODAL
    // ======================================================

    const handleOpenAddMember = () => {

        setShowAddMemberModal(true);

    };


    // ======================================================
    // ADD MEMBER
    // ======================================================

    const handleAddMember = async (userId) => {

        try {

            setAddingMember(true);

            console.log(
                "ADDING TEAM MEMBER:",
                {
                    teamId,
                    userId
                }
            );

            const response =
                await addTeamMember(
                    Number(teamId),
                    Number(userId)
                );

            console.log(
                "ADD MEMBER RESPONSE:",
                response
            );

            toast.success(
                "Member added successfully!"
            );

            setShowAddMemberModal(false);

            await fetchMembers();

            // Refresh activity immediately
            await fetchActivities();

        } catch (err) {

            console.error(
                "ADD MEMBER ERROR:",
                err
            );

            console.error(
                "ADD MEMBER RESPONSE:",
                err?.response
            );

            console.error(
                "ADD MEMBER RESPONSE DATA:",
                err?.response?.data
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add member."
            );

        } finally {

            setAddingMember(false);

        }

    };


    // ======================================================
    // MAKE MEMBER ADMIN
    // ======================================================

    const handleMakeAdmin = (member) => {

        if (!member) {
            return;
        }

        const memberId =
            member.id ??
            member.user_id;

        if (!memberId) {

            toast.error(
                "Member ID is missing."
            );

            return;

        }

        setConfirmAction({

            type: "make-admin",

            member

        });

    };


    // ======================================================
    // REMOVE ADMIN ROLE
    // ======================================================

    const handleRemoveAdmin = (member) => {

        if (!member) {
            return;
        }

        const memberId =
            member.id ??
            member.user_id;

        if (!memberId) {

            toast.error(
                "Member ID is missing."
            );

            return;

        }

        setConfirmAction({

            type: "remove-admin",

            member

        });

    };


    // ======================================================
    // REMOVE MEMBER
    // ======================================================

    const handleRemoveMember = (member) => {

        if (!member) {
            return;
        }

        const memberId =
            member.id ??
            member.user_id;

        if (!memberId) {

            toast.error(
                "Member ID is missing."
            );

            return;

        }


        // Prevent removing yourself

        if (
            String(memberId) ===
            String(user?.id)
        ) {

            toast.error(
                "You cannot remove yourself from the team."
            );

            return;

        }


        // Prevent removing owner

        if (
            member.role === "Owner"
        ) {

            toast.error(
                "Team owner cannot be removed."
            );

            return;

        }


        setConfirmAction({

            type: "remove-member",

            member

        });

    };


    // ======================================================
    // CONFIRM MEMBER ACTION
    // ======================================================

    const handleConfirmAction = async () => {

        if (!confirmAction?.member) {
            return;
        }

        const member =
            confirmAction.member;

        const memberId =
            member.id ??
            member.user_id;

        try {

            setConfirmLoading(true);

            setUpdatingUserId(
                memberId
            );


            // ==============================================
            // MAKE ADMIN
            // ==============================================

            if (
                confirmAction.type ===
                "make-admin"
            ) {

                await makeMemberAdmin(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    `${member.name || "Member"} is now an Admin.`
                );

            }


            // ==============================================
            // REMOVE ADMIN
            // ==============================================

            if (
                confirmAction.type ===
                "remove-admin"
            ) {

                await removeAdminRole(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    `${member.name || "Member"} is now a regular Member.`
                );

            }


            // ==============================================
            // REMOVE MEMBER
            // ==============================================

            if (
                confirmAction.type ===
                "remove-member"
            ) {

                await removeTeamMember(
                    Number(teamId),
                    Number(memberId)
                );

                toast.success(
                    `${member.name || "Member"} removed from the team.`
                );

            }


            setConfirmAction(null);

            await fetchMembers();

            // Refresh activity immediately
            await fetchActivities();

        } catch (err) {

            console.error(
                "CONFIRM ACTION ERROR:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Action failed."
            );

        } finally {

            setConfirmLoading(false);

            setUpdatingUserId(null);

        }

    };


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
    // CURRENT USER ROLE
    // ======================================================

    const currentUserRole =
        currentUser?.role ||
        "Member";


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

                    <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-3 text-slate-500">
                        Loading workspace...
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


            {/* ==================================================
                HEADER
            ================================================== */}

            <DashboardHeader
                workspaceName={`Workspace #${teamId}`}
                userName={user?.name}
            />


            {/* ==================================================
                STATS
            ================================================== */}

            <StatsCards

                projects={
                    projects.length
                }

                members={
                    members.length
                }

                admins={
                    members.filter(
                        member =>
                            member.role === "Admin"
                    ).length
                }

                role={
                    currentUserRole
                }

            />


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <div className="grid grid-cols-3 gap-6 mt-8">


                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="col-span-2 space-y-6">

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


                    <QuickLinks />

                </div>


                {/* ==================================================
                    RIGHT
                ================================================== */}

                <div className="space-y-6">


                    {/* ==================================================
                        TEAM MEMBERS
                    ================================================== */}

                    <TeamMembersCard
                        members={members}
                        loading={loadingMembers}
                        onAddMember={handleOpenAddMember}
                        onRemoveMember={handleRemoveMember}
                        onMakeAdmin={handleMakeAdmin}
                        onRemoveAdmin={handleRemoveAdmin}
                        onViewAll={() =>
                            navigate(
                                `/team/${teamId}/members`
                            )
                        }
                        currentUserId={user?.id}
                        currentUserRole={currentUserRole}
                        updatingUserId={updatingUserId}
                    />


                    {/* ==================================================
                        TEAM ACTIVITY
                    ================================================== */}

                    <TeamActivityCard
                        activities={activities}
                        loading={loadingActivities}
                    />

                </div>

            </div>


            {/* ==================================================
                CREATE PROJECT MODAL
            ================================================== */}

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


            {/* ==================================================
                EDIT PROJECT MODAL
            ================================================== */}

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


            {/* ==================================================
                ADD MEMBER MODAL
            ================================================== */}

            <AddTeamMemberModal

                open={
                    showAddMemberModal
                }

                onClose={() =>
                    setShowAddMemberModal(false)
                }

                onAdd={
                    handleAddMember
                }

                loading={
                    addingMember
                }

            />


            {/* ==================================================
                CONFIRM ACTION MODAL
            ================================================== */}

            <ConfirmActionModal

                open={
                    !!confirmAction
                }

                title={
                    confirmAction?.type === "make-admin"
                        ? "Make Admin"
                        : confirmAction?.type === "remove-admin"
                            ? "Remove Admin Role"
                            : "Remove Member"
                }

                message={
                    confirmAction?.type === "make-admin"
                        ? `Make ${confirmAction?.member?.name || "this member"} an Admin?`
                        : confirmAction?.type === "remove-admin"
                            ? `Remove Admin role from ${confirmAction?.member?.name || "this member"}?`
                            : `Remove ${confirmAction?.member?.name || "this member"} from the team?`
                }

                confirmText={
                    confirmAction?.type === "make-admin"
                        ? "Make Admin"
                        : confirmAction?.type === "remove-admin"
                            ? "Remove Admin"
                            : "Remove Member"
                }

                cancelText="Cancel"

                loading={
                    confirmLoading
                }

                onConfirm={
                    handleConfirmAction
                }

                onCancel={() =>
                    setConfirmAction(null)
                }

            />

        </div>

    );

}