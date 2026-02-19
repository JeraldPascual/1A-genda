import { createContext, useContext, useState, useEffect } from 'react';


/**
 * React context for theme (dark/light) state and toggling.
 * Provides current theme and a toggleTheme function to consumers.
 * @typedef {Object} ThemeContextValue
 * @property {string} theme - The current theme, either 'dark' or 'light'.
 * @property {function():void} toggleTheme - Toggle between dark and light themes.
 */
const ThemeContext = createContext();


/**
 * Custom hook to access theme context.
 * Throws if used outside a ThemeProvider.
 * @returns {ThemeContextValue}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Provides theme context and manages dark/light mode state.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to receive theme context.
 * @returns {JSX.Element}
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
