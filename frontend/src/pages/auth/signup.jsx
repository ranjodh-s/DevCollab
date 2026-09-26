import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import { signup } from "../../api";
import toast from "react-hot-toast";

export default function Signup() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const redirectPath = searchParams.get("redirect");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

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

            const { data } = await signup(form);

            toast.success(data.message);

            // If signup was started from a workspace invite,
            // continue to the login page while preserving
            // the invite redirect.
            if (redirectPath) {

                navigate(
                    `/login?redirect=${encodeURIComponent(redirectPath)}`
                );

            } else {

                navigate("/login");

            }

        }
        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Signup failed"
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

                    Create your account

                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="block mb-2 font-medium">

                            Name

                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                    </div>

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
                            placeholder="Create a password"
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
                                ? "Creating Account..."
                                : "Sign Up"
                        }

                    </button>

                </form>

                <p className="mt-6 text-center text-slate-600">

                    Already have an account?

                    <Link
                        to={
                            redirectPath
                                ? `/login?redirect=${encodeURIComponent(redirectPath)}`
                                : "/login"
                        }
                        className="text-blue-600 font-semibold ml-1"
                    >

                        Login

                    </Link>

                </p>

            </div>

        </div>

    );

}