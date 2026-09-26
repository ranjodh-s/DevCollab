import { Plus } from "lucide-react";

export default function DashboardHeader({
    workspaceName,
    userName
}) {

    const firstName = userName?.split(" ")[0] || "";

    return (

        <div className="flex items-start justify-between">

            <div>

                <p className="uppercase tracking-[0.3em] text-sm text-slate-500">

                    {workspaceName}

                </p>

                <h1 className="text-5xl font-bold mt-2">

                    Good Morning, {firstName} 👋

                </h1>

                <p className="mt-4 text-slate-500 text-lg">

                    Here's what's happening across your workspace today.

                </p>

            </div>

        </div>

    );

}