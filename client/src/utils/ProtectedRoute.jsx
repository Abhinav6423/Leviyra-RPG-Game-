import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext.jsx";
import Loader from "./Loader.jsx";

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();

    if (!auth) {
        return null;
    }

    const { user, firebaseUser, loading } = auth;
    console.log('Protected user is', firebaseUser)

    if (loading) {
        return <Loader />
    }

    if (!firebaseUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;