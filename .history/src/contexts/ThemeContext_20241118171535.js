import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {}
});

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};