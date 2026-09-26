import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import TeamsHome from "./pages/teams/TeamsHome";
import Dashboard from "./pages/Dashboard";
import TeamMembersPage from "./pages/TeamMembersPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import ProjectDetails from "./pages/ProjectDetails";

import TeamInvite from "./pages/teams/TeamInvite";
import ProjectsCard from "./components/projects/ProjectsCard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import ProjectChats from "./pages/ProjectChatsList";
import ProjectChatPage from "./pages/ProjectChatPage";

function App() {

    return (

        <BrowserRouter>

            <Toaster position="top-right" />

            <Routes>

                {/* Public Routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/invite/:token"
                    element={<TeamInvite />}
                />

                {/* Protected Routes */}

                <Route element={<ProtectedRoute />}>


                    {/* Teams Home */}

                    <Route
                        path="/"
                        element={<TeamsHome />}
                    />

                    <Route
                        path="/teams"
                        element={<TeamsHome />}
                    />

                    {/* Dashboard / Workspace */}


                    <Route element={<MainLayout />}>
                        <Route
                            path="/team/:teamId/project/:projectId"
                            element={<ProjectDetails />}
                        />

                        <Route
                            path="/team/:teamId"
                            element={<Dashboard />}
                        />

                        {/* Workspace Members */}

                        <Route
                            path="/team/:teamId/members"
                            element={<TeamMembersPage />}
                        />

                        <Route
                            path="/team/:teamId/projects"
                            element={<Projects />}
                        />

                        <Route
                            path="/team/:teamId/tasks"
                            element={<Tasks />}
                        />

                        <Route
                            path="/team/:teamId/chats"
                            element={<ProjectChats />}
                        />

                        <Route
                            path="/team/:teamId/project/:projectId/chat"
                            element={<ProjectChatPage />}
                        />



                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;