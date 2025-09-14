import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as TransactionIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as UploadIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { logout } from '../../features/auth/authSlice';

const drawerWidth = 300;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#00d4aa' },
  { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions', color: '#ffa502' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', color: '#e94560' },
  { text: 'Upload', icon: <UploadIcon />, path: '/upload', color: '#5f27cd' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(16, 16, 24, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        borderBottom: '1px solid rgba(233, 69, 96, 0.1)',
        background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(0, 212, 170, 0.05) 100%)',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: 2,
          gap: 2,
        }}>
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            background: 'linear-gradient(135deg, #e94560, #00d4aa)',
            fontSize: '1.2rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(233, 69, 96, 0.3)',
          }}>
            <TrendingIcon />
          </Avatar>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'white', 
                fontSize: '1.4rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff, #e8eaed)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              FinanceHub
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Smart Financial Management
        </Typography>
        
        
      </Box>

      {/* Enhanced Navigation */}
      <List sx={{ px: 3, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 4,
                  py: 2,
                  px: 3,
                  background: isActive 
                    ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)` 
                    : 'transparent',
                  border: `1px solid ${isActive ? `${item.color}40` : 'transparent'}`,
                  color: isActive ? item.color : 'rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: `linear-gradient(180deg, ${item.color}, ${item.color}80)`,
                    borderRadius: '0 2px 2px 0',
                  } : {},
                  '&:hover': {
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color}30, ${item.color}15)` 
                      : `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                    border: `1px solid ${item.color}30`,
                    transform: 'translateX(8px)',
                    color: item.color,
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: 48,
                    fontSize: '1.3rem',
                    filter: isActive ? `drop-shadow(0 0 8px ${item.color}50)` : 'none',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 600, 
                    fontSize: '1rem',
                    letterSpacing: '0.01em',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(233, 69, 96, 0.1)' }} />

      {/* Enhanced Logout */}
      <Box sx={{ p: 3 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 4,
            py: 2,
            px: 3,
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.2)',
            color: '#ff4757',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(255, 71, 87, 0.2)',
              border: '1px solid rgba(255, 71, 87, 0.4)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255, 71, 87, 0.3)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 48 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Sign Out" 
            primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
