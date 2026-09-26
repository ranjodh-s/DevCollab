import { X } from "lucide-react";
import { useState } from "react";

export default function CreateTeamModal({

    open,

    onClose,

    onCreate

}) {

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    if (!open) return null;

    const handleSubmit = (e) => {

        e.preventDefault();

        onCreate({

            name,

            description

        });

    };

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

                <div className="flex items-center justify-between p-6 border-b">

                    <h2 className="text-xl font-semibold">

                        Create Team

                    </h2>

                    <button onClick={onClose}>

                        <X size={20} />

                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    <div>

                        <label className="block text-sm mb-2">

                            Team Name

                        </label>

                        <input

                            value={name}

                            onChange={(e)=>setName(e.target.value)}

                            className="w-full border rounded-lg px-4 py-3"

                            placeholder="DevCollab Team"

                            required

                        />

                    </div>

                    <div>

                        <label className="block text-sm mb-2">

                            Description

                        </label>

                        <textarea

                            rows={4}

                            value={description}

                            onChange={(e)=>setDescription(e.target.value)}

                            className="w-full border rounded-lg px-4 py-3"

                            placeholder="Describe your team"

                        />

                    </div>

                    <div className="flex justify-end gap-3">

                        <button

                            type="button"

                            onClick={onClose}

                            className="px-5 py-2 rounded-lg border"

                        >

                            Cancel

                        </button>

                        <button

                            className="px-5 py-2 rounded-lg bg-blue-600 text-white"

                        >

                            Create Team

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}