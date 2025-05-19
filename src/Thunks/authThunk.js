// loginUser.js
import { loginStart, loginFailure, loginSuccess } from "../Features/Slices/authSlice";

export const loginUser = (email, password) => async (dispatch) => {
    try {
        dispatch(loginStart());

        const credentials = {
            emailId: email,
            password: password
        };
        
        const backendURL = import.meta.env.VITE_BACKEND_URL;
        
        const response = await fetch(`${backendURL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials),
            mode: "cors"
        });

        console.log("Response:", response);

        if (response.ok) {
            const userData = await response.json();

            
            // When dispatching loginSuccess, include all relevant user data
            dispatch(loginSuccess({ 
                userData:userData
            }));
            
            return { success: true, userData };
        } else {
            const errorData = await response.json();
            dispatch(loginFailure(errorData.message || "Login failed"));
            return { success: false, error: errorData.message };
        }
    } catch (error) {
        dispatch(loginFailure("Network error: " + error.message));
        return { success: false, error: error.message };
    }
};