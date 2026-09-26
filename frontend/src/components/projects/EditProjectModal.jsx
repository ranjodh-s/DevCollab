import { useEffect, useState } from "react";
import {
    X,
    FolderKanban
} from "lucide-react";

export default function EditProjectModal({
    open,
    project,
    onClose,
    onUpdate
}) {

    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // ======================================================
    // LOAD PROJECT DATA
    // ======================================================

    useEffect(() => {

        if (!project) {
            return;
        }

        setName(
            project.name || ""
        );

        setDescription(
            project.description || ""
        );

    }, [project]);


    if (!open || !project) {
        return null;
    }


    // ======================================================
    // SUBMIT
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!name.trim()) {
            return;
        }


        try {

            setLoading(true);


            await onUpdate({

                name:
                    name.trim(),

                description:
                    description.trim()

            });


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
        ">

            <div className="
                w-full
                max-w-md
                bg-white
                rounded-2xl
                shadow-2xl
            ">


                {/* HEADER */}

                <div className="
                    flex
                    items-center
                    justify-between
                    p-6
                    border-b
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-blue-100
                            flex
                            items-center
                            justify-center
                        ">

                            <FolderKanban
                                size={22}
                                className="text-blue-600"
                            />

                        </div>


                        <div>

                            <h2 className="
                                text-xl
                                font-bold
                            ">
                                Edit Project
                            </h2>

                            <p className="
                                text-sm
                                text-slate-500
                            ">
                                Update your project details.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            p-2
                            rounded-lg
                            hover:bg-slate-100
                        "
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6"
                >


                    {/* NAME */}

                    <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-700
                        mb-2
                    ">
                        Project Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Project name"
                        autoFocus
                        className="
                            w-full
                            border
                            border-slate-300
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:border-blue-500
                        "
                    />


                    {/* DESCRIPTION */}

                    <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-700
                        mt-5
                        mb-2
                    ">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        placeholder="Describe this project..."
                        rows={4}
                        className="
                            w-full
                            border
                            border-slate-300
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            resize-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:border-blue-500
                        "
                    />


                    {/* BUTTONS */}

                    <div className="
                        flex
                        justify-end
                        gap-3
                        mt-6
                    ">

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-5
                                py-2.5
                                rounded-xl
                                border
                                border-slate-300
                                hover:bg-slate-50
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !name.trim()
                            }
                            className="
                                px-5
                                py-2.5
                                rounded-xl
                                bg-blue-600
                                text-white
                                hover:bg-blue-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {loading
                                ? "Saving..."
                                : "Save Changes"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}