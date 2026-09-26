import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function TeamsNavbar() {

    const navigate = useNavigate();

    const { user, logout } = useAuthStore();

    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {

        const handleClick = (e) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {

                setOpen(false);

            }

        };

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClick
            );

    }, []);

    return (

        <header className="h-20 bg-white border-b px-10 flex items-center justify-between">

            <h1 className="text-3xl font-bold text-blue-600">

                DevCollab

            </h1>

            <div
                ref={menuRef}
                className="relative"
            >

                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-3"
                >

                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                        {user?.name?.charAt(0).toUpperCase()}

                    </div>

                    <ChevronDown
                        size={18}
                        className={`transition ${open ? "rotate-180" : ""}`}
                    />

                </button>

                {open && (

                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border overflow-hidden z-50">

                        <div className="p-5">

                            <h3 className="font-semibold">

                                {user?.name}

                            </h3>

                            <p className="text-sm text-slate-500">

                                {user?.email}

                            </p>

                        </div>

                        <hr />

                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-100"
                        >

                            <User size={18} />

                            Profile

                        </button>

                        <button

                            onClick={() => {

                                logout();

                                navigate("/login");

                            }}

                            className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50"

                        >

                            <LogOut size={18} />

                            Logout

                        </button>

                    </div>

                )}

            </div>

        </header>

    );

}