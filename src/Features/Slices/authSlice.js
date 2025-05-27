import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely parse JSON from localStorage
const getStoredData = (key) => {
    try {
        const data = localStorage.getItem(key);
        console.log("Parsed UserData:", JSON.parse(data))
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage:`, error);
        return null;
    }
};

// Get stored values from localStorage on initial load
const userDataFromStorage = getStoredData("userData");
const tokenFromStorage = localStorage.getItem("token");
const uniqueIdFromStorage = localStorage.getItem("uniqueId");

const initialState = {
    isAuthenticated: !!tokenFromStorage,
    user: userDataFromStorage || null,
    token: tokenFromStorage || null,
    uniqueId: uniqueIdFromStorage || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            
            const payload = action.payload;
            
            // Handle different possible response structures
            const userData = payload.userData?.userData || payload.userData || payload;
            const token = payload.userData?.token || payload.token || "";
            
            state.token = token;
            state.user = userData;
            
            // Store the complete userData object as JSON in localStorage
            localStorage.setItem("userData", JSON.stringify(userData));
            localStorage.setItem("token", token);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.uniqueId = null;
            
            // Clear localStorage
            localStorage.removeItem("userData");
            localStorage.removeItem("token");
        },setUniqueId: (state, action) => {
            state.uniqueId = action.payload.uniqueId;
            localStorage.setItem("uniqueId", action.payload.uniqueId);
        },updateUserProfile: (state, action) => {
            // Merge the new profile data with existing user data
            state.user = { ...state.user, ...action.payload };
            
            // Update localStorage with the new user data
            localStorage.setItem("userData", JSON.stringify(state.user));
        }
    }
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUniqueId,
    setProfilePicture,
    updateUserProfile
} = authSlice.actions;

export default authSlice.reducer;