import {
    MessageSquare,
    Users,
    Activity,
    Settings
} from "lucide-react";

const links = [

    {
        icon: MessageSquare,
        title: "Workspace Chat"
    },

    {
        icon: Users,
        title: "Members"
    },

    {
        icon: Activity,
        title: "Activity"
    },

    {
        icon: Settings,
        title: "Settings"
    }

];

export default function QuickLinks() {

    return (

        <div className="bg-white rounded-2xl shadow-sm border">

            <div className="p-5 border-b">

                <h2 className="font-bold tracking-widest text-sm uppercase">

                    Quick Links

                </h2>

            </div>

            <div className="grid grid-cols-2 gap-4 p-5">

                {links.map((link) => (

                    <button
                        key={link.title}
                        className="border rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
                    >

                        <link.icon size={20} />

                        {link.title}

                    </button>

                ))}

            </div>

        </div>

    );

}