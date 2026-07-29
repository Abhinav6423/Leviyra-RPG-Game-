import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import api from "../lib/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState(undefined);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
        } catch (err) {
            console.error("FETCH USER ERROR:", err?.response || err);
            setUser(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser && fbUser.emailVerified) {
                try {
                    const token = await fbUser.getIdToken();
                    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                    await api.post("/auth/sync-user", {});
                    await fetchUser();

                } catch (err) {
                    console.error("AUTH ERROR:", err?.response || err);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                delete api.defaults.headers.common["Authorization"];
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};