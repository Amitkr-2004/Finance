import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Navbar = ({ handleDrawerToggle }) => {
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, rgba(16, 16, 24, 0.95) 0%, rgba(26, 26, 46, 0.90) 100%)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(233, 69, 96, 0.1)',
        color: 'white',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            mr: 3, 
            display: { lg: 'none' },
            borderRadius: 3,
            p: 1.5,
            background: 'rgba(233, 69, 96, 0.15)',
            border: '1px solid rgba(233, 69, 96, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(233, 69, 96, 0.25)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.01em',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Financial Dashboard
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Real-time Insights & Analytics
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <Box sx={{ flexGrow: 1 }} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Quick Actions */}
            

            {/* Action Icons */}
            
            
            

            <ThemeToggle />

            {/* User Profile */}
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                ml: 2,
                px: 3,
                py: 1.5,
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.15), rgba(0, 212, 170, 0.10))',
                border: '1px solid rgba(233, 69, 96, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.25), rgba(0, 212, 170, 0.15))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(233, 69, 96, 0.3)',
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #e94560, #00d4aa)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                A
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  Amit
                </Typography>
                
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
