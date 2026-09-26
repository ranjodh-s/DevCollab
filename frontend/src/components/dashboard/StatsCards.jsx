import {
    FolderKanban,
    Users,
    Crown,
    Shield
} from "lucide-react";

export default function StatsCards({

    projects,
    members,
    admins,
    role

}) {

    const cards = [

        {
            icon: FolderKanban,
            title: "Projects",
            value: projects
        },

        {
            icon: Users,
            title: "Members",
            value: members
        },

        {
            icon: Crown,
            title: "Admins",
            value: admins
        },

        {
            icon: Shield,
            title: "Your Role",
            value: role
        }

    ];

    return (

        <div className="grid grid-cols-4 gap-6 mt-10">

            {cards.map((card) => (

                <div
                    key={card.title}
                    className="bg-white rounded-2xl shadow-sm border p-6"
                >

                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                            <card.icon
                                size={24}
                                className="text-blue-600"
                            />

                        </div>

                        <div>

                            <h2 className="text-3xl font-bold">

                                {card.value}

                            </h2>

                            <p className="text-slate-500 uppercase tracking-widest text-xs">

                                {card.title}

                            </p>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}