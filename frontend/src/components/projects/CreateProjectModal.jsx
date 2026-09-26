import { useState } from "react";
import { X, FolderKanban } from "lucide-react";

export default function CreateProjectModal({
    open,
    onClose,
    onCreate
}) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);


    if (!open) {
        return null;
    }


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!name.trim()) {
            return;
        }


        try {

            setLoading(true);


            await onCreate({

                name:
                    name.trim(),

                description:
                    description.trim()

            });


            // Reset form after successful creation
            setName("");
            setDescription("");


        } finally {

            setLoading(false);

        }

    };


    const handleClose = () => {

        if (loading) {
            return;
        }

        setName("");
        setDescription("");

        onClose();

    };


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between p-6 border-b">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                            <FolderKanban
                                size={22}
                                className="text-blue-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-bold">
                                Create Project
                            </h2>

                            <p className="text-sm text-slate-500">
                                Start organizing your work.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6"
                >

                    {/* PROJECT NAME */}

                    <label className="block text-sm font-medium text-slate-700 mb-2">

                        Project Name

                    </label>


                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="e.g. Website Redesign"
                        autoFocus
                        disabled={loading}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
                    />


                    {/* DESCRIPTION */}

                    <label className="block text-sm font-medium text-slate-700 mt-5 mb-2">

                        Description

                        <span className="text-slate-400 font-normal ml-1">
                            (optional)
                        </span>

                    </label>


                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Describe what this project is about..."
                        rows={4}
                        disabled={loading}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
                    />


                    {/* BUTTONS */}

                    <div className="flex justify-end gap-3 mt-6">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !name.trim()
                            }
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >

                            {loading
                                ? "Creating..."
                                : "Create Project"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}