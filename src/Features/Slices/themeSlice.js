import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme !== null) {
    return savedTheme === 'true';
  }
  // Use system preference as default if available
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState = {
  darkMode: getInitialTheme()
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      // Update localStorage when darkMode changes
      localStorage.setItem('darkMode', state.darkMode);
      
      // Update document class for Tailwind dark mode
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      // Update localStorage when darkMode changes
      localStorage.setItem('darkMode', state.darkMode);
      
      // Update document class for Tailwind dark mode
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;

export default themeSlice.reducer;