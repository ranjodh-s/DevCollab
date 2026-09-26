import { useEffect, useState } from "react";
import {
    X,
    Plus,
    AlignLeft,
    Flag,
    CalendarDays
} from "lucide-react";

export default function CreateTaskModal({
    open,
    onClose,
    onCreate
}) {

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: ""
    });

    const [submitting, setSubmitting] = useState(false);


    useEffect(() => {

        if (open) {

            setFormData({
                title: "",
                description: "",
                priority: "Medium",
                dueDate: ""
            });

            setSubmitting(false);
        }

    }, [open]);


    if (!open) {
        return null;
    }


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.title.trim()) {
            return;
        }

        try {

            setSubmitting(true);

            await onCreate(formData);

        } catch (error) {

            console.error(error);

        } finally {

            setSubmitting(false);

        }

    };


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

            {/* Backdrop */}

            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />


            {/* Modal */}

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">


                {/* Header */}

                <div className="flex items-center justify-between px-6 py-5 border-b">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">
                            Create Task
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Add a new task to this project.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    {/* Title */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Task Title
                        </label>

                        <div className="relative">

                            <AlignLeft
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Build authentication page"
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />

                        </div>

                    </div>


                    {/* Description */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                            Description

                            <span className="font-normal text-slate-400">
                                {" "}Optional
                            </span>

                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe what needs to be done..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />

                    </div>


                    {/* Priority + Date */}

                    <div className="grid grid-cols-2 gap-4">

                        {/* Priority */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Priority
                            </label>

                            <div className="relative">

                                <Flag
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full appearance-none pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >

                                    <option value="Low">
                                        Low
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Urgent">
                                        Urgent
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Due Date */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Due Date
                            </label>

                            <div className="relative">

                                <CalendarDays
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />

                            </div>

                        </div>

                    </div>


                    {/* Buttons */}

                    <div className="flex justify-end gap-3 pt-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !formData.title.trim()
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >

                            <Plus size={18} />

                            {submitting
                                ? "Creating..."
                                : "Create Task"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}