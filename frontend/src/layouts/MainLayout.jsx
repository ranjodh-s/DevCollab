import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";

import Sidebar from "../components/layout/Sidebar";

export default function MainLayout(){

    return(

        <div className="flex h-screen bg-slate-100">

            <Sidebar/>

            <div className="flex flex-col flex-1">

                <Navbar/>

                <main className="flex-1 overflow-y-auto p-6">

                    <Outlet/>

                </main>

            </div>

        </div>

    );

}