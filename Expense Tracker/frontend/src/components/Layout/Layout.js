import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.palette.mode === 'dark' 
          ? 'radial-gradient(circle at 20% 80%, rgba(233, 69, 96, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 212, 170, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 80%, rgba(233, 69, 96, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 212, 170, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }
    }}>
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />
      <Box sx={{ 
        flexGrow: 1, 
        width: { lg: `calc(100% - 300px)` },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        <Navbar handleDrawerToggle={handleDrawerToggle} />
        <Box sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
