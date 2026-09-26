import { NavLink } from "react-router-dom";


export default function SidebarLink({

    to,

    icon,

    text

}){

    return(

        <NavLink

            to={to}

            className={({isActive})=>

                `

                flex

                items-center

                gap-3

                px-4

                py-3

                rounded-lg

                transition

                ${

                    isActive

                    ?

                    "bg-blue-600 text-white"

                    :

                    "text-slate-700 hover:bg-slate-100"

                }

                `

            }

        >

            {icon}

            <span>

                {text}

            </span>

        </NavLink>

    );

}