import {
    X,
    UserPlus,
    UserRound
} from "lucide-react";

import { useState } from "react";


export default function AddTeamMemberModal({
    open,
    onClose,
    onAdd,
    loading = false
}) {

    const [userId, setUserId] = useState("");


    if (!open) {
        return null;
    }


    const handleSubmit = async (e) => {

        e.preventDefault();

        const trimmedId =
            userId.trim();

        if (!trimmedId) {
            return;
        }

        await onAdd(trimmedId);

    };


    const handleClose = () => {

        if (loading) {
            return;
        }

        setUserId("");

        onClose();

    };


    return (

        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">

            {/* BACKDROP */}

            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={handleClose}
            />


            {/* MODAL */}

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* HEADER */}

                <div className="flex items-center justify-between px-6 py-5 border-b">

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                            <UserPlus
                                size={21}
                                className="text-blue-600"
                            />

                        </div>

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">

                                Team

                            </p>

                            <h2 className="text-xl font-bold text-slate-900">

                                Add Member

                            </h2>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            User ID

                        </label>

                        <div className="relative">

                            <UserRound
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="number"
                                min="1"
                                value={userId}
                                onChange={(e) =>
                                    setUserId(
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                                placeholder="Enter user ID"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 transition"
                                autoFocus
                            />

                        </div>

                        <p className="text-xs text-slate-400 mt-2">

                            Enter the ID of the registered user you want to add.

                        </p>

                    </div>


                    {/* ACTIONS */}

                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !userId.trim()
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >

                            <UserPlus size={17} />

                            {loading
                                ? "Adding..."
                                : "Add Member"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}