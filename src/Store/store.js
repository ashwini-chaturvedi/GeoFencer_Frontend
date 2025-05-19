import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../Features/Slices/authSlice';
import themeReducer from '../Features/Slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    // Add other reducers as needed
  },
});

// Initialize dark mode on app start
const savedTheme = localStorage.getItem('darkMode') === 'true';
if (savedTheme) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export default store;