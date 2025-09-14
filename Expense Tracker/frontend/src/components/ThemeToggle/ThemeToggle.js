import React from 'react';
import { IconButton } from '@mui/material';
import { 
  LightMode as LightModeIcon, 
  DarkMode as DarkModeIcon 
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <IconButton
      onClick={toggleDarkMode}
      sx={{
        borderRadius: 3,
        p: 1.5,
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: darkMode ? '#00d4aa' : '#ffa502',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: darkMode ? '0%' : '100%',
          width: '100%',
          height: '100%',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 212, 170, 0.1))' 
            : 'linear-gradient(135deg, rgba(255, 165, 2, 0.2), rgba(255, 165, 2, 0.1))',
          transition: 'left 0.3s ease',
          zIndex: -1,
        },
        '&:hover': {
          background: darkMode 
            ? 'rgba(0, 212, 170, 0.15)' 
            : 'rgba(255, 165, 2, 0.15)',
          border: darkMode 
            ? '1px solid rgba(0, 212, 170, 0.3)' 
            : '1px solid rgba(255, 165, 2, 0.3)',
          transform: 'scale(1.05)',
          '&:before': {
            left: '0%',
          }
        },
      }}
    >
      {darkMode ? (
        <DarkModeIcon sx={{ fontSize: '1.2rem' }} />
      ) : (
        <LightModeIcon sx={{ fontSize: '1.2rem' }} />
      )}
    </IconButton>
  );
};

export default ThemeToggle;
