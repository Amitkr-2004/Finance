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
            <Chip 
              label="LIVE"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #00d4aa, #33e4c4)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
                boxShadow: '0 0 16px rgba(0, 212, 170, 0.5)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 16px rgba(0, 212, 170, 0.5)' },
                  '50%': { boxShadow: '0 0 24px rgba(0, 212, 170, 0.7)' },
                  '100%': { boxShadow: '0 0 16px rgba(0, 212, 170, 0.5)' },
                }
              }}
            />
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
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  '&:hover': {
                    borderColor: '#00d4aa',
                    color: '#00d4aa',
                    background: 'rgba(0, 212, 170, 0.1)',
                  }
                }}
              >
                Quick Add
              </Button>
            </Box>

            {/* Action Icons */}
            <IconButton 
              sx={{
                borderRadius: 3,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 165, 2, 0.15)',
                  border: '1px solid rgba(255, 165, 2, 0.3)',
                  color: '#ffa502',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <SearchIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            
            <IconButton 
              sx={{
                borderRadius: 3,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(233, 69, 96, 0.15)',
                  border: '1px solid rgba(233, 69, 96, 0.3)',
                  color: '#e94560',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Badge 
                badgeContent={3} 
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 2,
                  }
                }}
              >
                <NotificationIcon sx={{ fontSize: '1.2rem' }} />
              </Badge>
            </IconButton>

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
                FU
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
                  Finance User
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  Premium Member
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
