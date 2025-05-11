import { loginStart, loginFailure, loginSuccess } from "../Features/Slices/authSlice";

export const loginUser = (email, password) => async (dispatch) => {
    try {
        dispatch(loginStart())

        const credentials = {
            emailId: email,
            password: password
        }
        
        const backendURL = import.meta.env.VITE_BACKEND_URL;
        console.log("Credentials:",credentials)
        
        const response = await fetch(`${backendURL}/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify(credentials),
            mode: "cors"
        });

        console.log("JWT:",response)

        if (response.ok) {
            const token = await response.text(); // ✅ parse the body

            console.log("JWT Token:", token);

            dispatch(loginSuccess({ email, token }));
            return { success: true, email, token };
        } else {
            const errorData = await response.json();
            dispatch(loginFailure(errorData.message || "Login failed"));
            return { success: false };
        }
    } catch (error) {
        dispatch(loginFailure("Network error: " + error.message));
        return { success: false };
    }
}