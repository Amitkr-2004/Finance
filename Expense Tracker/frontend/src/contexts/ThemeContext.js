import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#e94560',
        light: '#ff6b88',
        dark: '#c7324b',
      },
      secondary: {
        main: '#00d4aa',
        light: '#33e4c4',
        dark: '#00b892',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      success: {
        main: '#00d4aa',
      },
      error: {
        main: '#ff4757',
      },
      warning: {
        main: '#ffa502',
      },
      text: {
        primary: '#1a1a2e',
        secondary: '#64748b',
      },
    },
    typography: {
      fontFamily: '"SF Pro Display", "Inter", "Segoe UI", "Roboto", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.022em' },
      h3: { fontWeight: 700, letterSpacing: '-0.020em' },
      h4: { fontWeight: 700, letterSpacing: '-0.018em' },
      h5: { fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.010em' },
      body1: { fontWeight: 400, letterSpacing: '0.005em', lineHeight: 1.7 },
      body2: { fontWeight: 400, letterSpacing: '0.003em', lineHeight: 1.6 },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0 2px 8px rgba(0,0,0,0.04)',
      '0 4px 16px rgba(0,0,0,0.06)',
      '0 8px 24px rgba(0,0,0,0.08)',
      '0 12px 32px rgba(0,0,0,0.10)',
      '0 16px 40px rgba(0,0,0,0.12)',
      '0 20px 48px rgba(0,0,0,0.14)',
      '0 24px 56px rgba(0,0,0,0.16)',
      '0 28px 64px rgba(0,0,0,0.18)',
      '0 32px 72px rgba(0,0,0,0.20)',
      // ... continue with remaining shadow levels
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(233, 69, 96, 0.08)',
            borderRadius: 24,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 25px 50px rgba(233, 69, 96, 0.15)',
              border: '1px solid rgba(233, 69, 96, 0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.925rem',
            letterSpacing: '0.02em',
            padding: '12px 24px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s ease',
            border: '1px solid rgba(233, 69, 96, 0.05)',
          },
        },
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#e94560',
        light: '#ff6b88',
        dark: '#c7324b',
      },
      secondary: {
        main: '#00d4aa',
        light: '#33e4c4',
        dark: '#00b892',
      },
      background: {
        default: '#0a0a0f',
        paper: 'rgba(16, 16, 24, 0.95)',
      },
      success: {
        main: '#00d4aa',
      },
      error: {
        main: '#ff4757',
      },
      warning: {
        main: '#ffa502',
      },
      info: {
        main: '#5f27cd',
      },
      text: {
        primary: '#e8eaed',
        secondary: '#9aa0a6',
      },
    },
    typography: {
      fontFamily: '"SF Pro Display", "Inter", "Segoe UI", "Roboto", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.022em' },
      h3: { fontWeight: 700, letterSpacing: '-0.020em' },
      h4: { fontWeight: 700, letterSpacing: '-0.018em' },
      h5: { fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.010em' },
      body1: { fontWeight: 400, letterSpacing: '0.005em', lineHeight: 1.7 },
      body2: { fontWeight: 400, letterSpacing: '0.003em', lineHeight: 1.6 },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0 2px 8px rgba(233,69,96,0.15)',
      '0 4px 16px rgba(233,69,96,0.20)',
      '0 8px 24px rgba(233,69,96,0.25)',
      '0 12px 32px rgba(233,69,96,0.30)',
      '0 16px 40px rgba(233,69,96,0.35)',
      '0 20px 48px rgba(233,69,96,0.40)',
      '0 24px 56px rgba(233,69,96,0.45)',
      '0 28px 64px rgba(233,69,96,0.50)',
      '0 32px 72px rgba(233,69,96,0.55)',
      // ... continue with remaining shadow levels
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 16, 24, 0.95) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(233, 69, 96, 0.15)',
            borderRadius: 24,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              transform: 'translateY(-8px)',
              border: '1px solid rgba(233, 69, 96, 0.3)',
              boxShadow: '0 25px 50px rgba(233, 69, 96, 0.25)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.925rem',
            letterSpacing: '0.02em',
            padding: '12px 24px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 16, 24, 0.95) 100%)',
            backdropFilter: 'blur(30px)',
            transition: 'all 0.4s ease',
            border: '1px solid rgba(233, 69, 96, 0.1)',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 16, 24, 0.95) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(233, 69, 96, 0.15)',
            borderRadius: 24,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(16, 16, 24, 0.98) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(233, 69, 96, 0.2)',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
