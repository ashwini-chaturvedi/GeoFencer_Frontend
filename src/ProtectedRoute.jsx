import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute=({children})=>{
    const isLoggedIn=!!localStorage.getItem("token");

    if(!isLoggedIn){
        return <Navigate to="/" replace />;
    }
    return children
}

export default  ProtectedRoute;
