import {
    Search,
    Bell,
    ChevronDown,
    User,
    Settings,
    LogOut
} from "lucide-react";

import {
    useState,
    useRef,
    useEffect
} from "react";

import { useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";

export default function Navbar() {

    const user = useAuthStore(
        state => state.user
    );

    // Later we'll connect this to your store
    // const logout = useAuthStore(state => state.logout);

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {

                setOpen(false);

            }

        };

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

    const handleLogout = () => {

        // logout();

        localStorage.removeItem("token");

        navigate("/login");

    };

    return (

        <header className="bg-white border-b px-8 h-20 flex items-center justify-between">

            {/* Search */}

            <div className="relative w-96">

                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

            </div>

            {/* Right Section */}

            <div className="flex items-center gap-6">

                {/* Notifications */}

                <button className="relative hover:text-blue-600 transition">

                    <Bell
                        size={22}
                        className="text-slate-600"
                    />

                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>

                </button>

                {/* Profile */}

                <div
                    ref={menuRef}
                    className="relative"
                >

                    <button

                        onClick={() => setOpen(!open)}

                        className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100 transition-all duration-200"

                    >

                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">

                            {user?.name?.charAt(0)?.toUpperCase()}

                        </div>

                        <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                                }`}
                        />

                    </button>

                    <div
                        className={`absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border overflow-hidden z-50 transition-all duration-200 ${open
                                ? "opacity-100 translate-y-0 visible"
                                : "opacity-0 -translate-y-2 invisible"
                            }`}
                    >

                        {/* Header */}

                        <div className="flex items-center gap-4 p-5">

                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">

                                {user?.name?.charAt(0)?.toUpperCase()}

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">

                                    {user?.name}

                                </h3>

                                <p className="text-sm text-slate-500">

                                    View Profile

                                </p>

                            </div>

                        </div>

                        <hr />

                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-100 transition"
                        >

                            <User size={18} />

                            My Profile

                        </button>

                        <button
                            onClick={() => navigate("/settings")}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-100 transition"
                        >

                            <Settings size={18} />

                            Settings

                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 transition"
                        >

                            <LogOut size={18} />

                            Logout

                        </button>

                    </div>

                </div>

            </div>

        </header>

    );

}