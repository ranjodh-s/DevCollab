import { useEffect, useState } from "react";

import { getCurrentUser } from "../api";

import useAuthStore from "../store/authStore";

export default function AuthInitializer({

    children

}) {

    const token =
        useAuthStore(
            state => state.token
        );

    const setUser =
        useAuthStore(
            state => state.setUser
        );

    const logout =
        useAuthStore(
            state => state.logout
        );

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const initialize =
            async () => {

                if (!token) {

                    setLoading(false);

                    return;

                }

                try {

                    const { data } =
                        await getCurrentUser();

                    setUser(data.user);

                }
                catch {

                    logout();

                }
                finally {

                    setLoading(false);

                }

            };

        initialize();

    }, []);

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                Loading...

            </div>

        );

    }

    return children;

}