import { createSlice } from "@reduxjs/toolkit";

const tokenFromStorage = localStorage.getItem("jwtToken");
const emailFromStorage = localStorage.getItem("emailId");
const uniqueIdFromStorage = localStorage.getItem("uniqueId");

const initialState = {
    isAuthenticated: !!tokenFromStorage,
    email: emailFromStorage || null,
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
            state.error = null
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.email = action.payload.email;
            state.token = action.payload.token;
            localStorage.setItem("emailId", action.payload.email);//Saves the token to the local storage
            localStorage.setItem("jwtToken", action.payload.token);//Saves the token to the local storage
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.email = null;
            state.uniqueId = null;
            localStorage.removeItem("jwtToken");//remove token
            localStorage.removeItem("emailId");//remove email
        },
        // New reducer for setting uniqueId
        setUniqueId: (state, action) => {
            state.uniqueId = action.payload;
            localStorage.setItem("uniqueId", action.payload.uniqueId);
        }
    }
})

//Normally Export the reducers and default export the authslice reducer
export const { loginStart, loginSuccess, loginFailure, logout, setUniqueId } = authSlice.actions

export default authSlice.reducer