import {
    AlertTriangle,
    X
} from "lucide-react";


export default function ConfirmActionModal({
    open,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
    danger = false
}) {

    if (!open) {
        return null;
    }


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* BACKDROP */}

            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!loading ? onCancel : undefined}
            />


            {/* MODAL */}

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* HEADER */}

                <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">

                    <div className="flex items-center gap-3">

                        <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                danger
                                    ? "bg-red-100 text-red-600"
                                    : "bg-blue-100 text-blue-600"
                            }`}
                        >

                            <AlertTriangle size={21} />

                        </div>

                        <div>

                            <h2 className="text-lg font-bold text-slate-900">

                                {title}

                            </h2>

                            <p className="text-xs text-slate-400 mt-0.5">

                                Please confirm this action.

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
                    >

                        <X size={18} />

                    </button>

                </div>


                {/* MESSAGE */}

                <div className="px-6 py-5">

                    <p className="text-sm text-slate-600 leading-6">

                        {message}

                    </p>

                </div>


                {/* FOOTER */}

                <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                    >

                        {cancelText}

                    </button>


                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`min-w-[100px] px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >

                        {loading ? (

                            <span className="flex items-center justify-center gap-2">

                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                                Processing...

                            </span>

                        ) : (

                            confirmText

                        )}

                    </button>

                </div>

            </div>

        </div>

    );

}