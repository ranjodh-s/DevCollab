import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import { login } from "../../api";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function Login() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const redirectPath = searchParams.get("redirect");

    const loginUser = useAuthStore(
        state => state.login
    );

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const { data } = await login(form);

            loginUser(
                data.user,
                data.token
            );

            toast.success("Welcome back!");

            // Return to the invite page if login
            // was started from an invite link.
            if (redirectPath) {
                navigate(redirectPath, {
                    replace: true
                });
            } else {
                navigate("/teams");
            }

        }
        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Login failed"
            );

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

                <h1 className="text-3xl font-bold text-center text-slate-800">

                    DevCollab

                </h1>

                <p className="text-center text-slate-500 mt-2 mb-8">

                    Login to your account

                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="block mb-2 font-medium">

                            Email

                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 font-medium">

                            Password

                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60"
                    >

                        {
                            loading
                                ? "Logging in..."
                                : "Login"
                        }

                    </button>

                    <div className="flex items-center my-6">

                        <div className="flex-1 border-t border-slate-300"></div>

                        <span className="px-4 text-sm text-slate-500 font-medium">
                            OR
                        </span>

                        <div className="flex-1 border-t border-slate-300"></div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            alert("Google Sign-In coming soon 🚀")
                        }
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm active:scale-[0.99]"
                    >

                        <FcGoogle size={22} />

                        Continue with Google

                    </button>

                </form>

                <p className="mt-6 text-center text-slate-600">

                    Don't have an account?

                    <Link
                        to={
                            redirectPath
                                ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
                                : "/signup"
                        }
                        className="text-blue-600 font-semibold ml-1"
                    >

                        Sign Up

                    </Link>

                </p>

            </div>

        </div>

    );

}
