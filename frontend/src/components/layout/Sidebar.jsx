import {
    useState,
    useRef,
    useEffect
} from "react";

import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CheckSquare,
    MessageCircle,
    Bell,
    Settings,
    User,
    LogOut,
    ChevronUp
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import useAuthStore from "../../store/authStore";
import SidebarLink from "./SidebarLink";

export default function Sidebar() {

    const [openMenu, setOpenMenu] = useState(false);

    const user = useAuthStore(
        state => state.user
    );

    const logout = useAuthStore(
        state => state.logout
    );

    const navigate = useNavigate();

    const { teamId } = useParams();

    const menuRef = useRef(null);

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenu(false);
            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);

    return (

        <aside className="w-64 bg-white border-r flex flex-col">

            {/* Logo */}

            <div className="p-6 border-b">

                <h1 className="text-2xl font-bold text-blue-600">

                    DevCollab

                </h1>

            </div>


            {/* Navigation */}

            <nav className="flex-1 p-4 space-y-2">

                {/* Dashboard */}

                <SidebarLink
                    to={`/team/${teamId}`}
                    icon={
                        <LayoutDashboard size={20} />
                    }
                    text="Dashboard"
                />


                {/* Teams */}

                <SidebarLink
                    to="/teams"
                    icon={
                        <Users size={20} />
                    }
                    text="Teams"
                />


                {/* Projects */}

                <SidebarLink
                    to={`/team/${teamId}/projects`}
                    icon={
                        <FolderKanban size={20} />
                    }
                    text="Projects"
                />


                {/* Tasks */}

                <SidebarLink
                    to={`/team/${teamId}/tasks`}
                    icon={
                        <CheckSquare size={20} />
                    }
                    text="Tasks"
                />


                {/* Chat */}

                <SidebarLink
                    to={`/team/${teamId}/chats`}
                    icon={
                        <MessageCircle size={20} />
                    }
                    text="Chat"
                />


                {/* Notifications */}

                <SidebarLink
                    to="/notifications"
                    icon={
                        <Bell size={20} />
                    }
                    text="Notifications"
                />


                {/* Settings */}

                <SidebarLink
                    to="/settings"
                    icon={
                        <Settings size={20} />
                    }
                    text="Settings"
                />

            </nav>


            {/* User section */}

            <div
                ref={menuRef}
                className="relative border-t"
            >

                <button
                    onClick={() =>
                        setOpenMenu(!openMenu)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition"
                >

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase()
                            }

                        </div>

                        <div className="text-left">

                            <p className="font-semibold">

                                {user?.name}

                            </p>

                            <p className="text-sm text-slate-500">

                                {user?.email}

                            </p>

                        </div>

                    </div>

                    <ChevronUp
                        size={18}
                        className={`transition-transform ${
                            openMenu
                                ? "rotate-180"
                                : ""
                        }`}
                    />

                </button>


                {/* User Dropdown */}

                {openMenu && (

                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border overflow-hidden">

                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
                        >

                            <User size={18} />

                            Profile

                        </button>


                        <button
                            onClick={() =>
                                navigate("/settings")
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
                        >

                            <Settings size={18} />

                            Settings

                        </button>


                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                        >

                            <LogOut size={18} />

                            Logout

                        </button>

                    </div>

                )}

            </div>

        </aside>

    );

}