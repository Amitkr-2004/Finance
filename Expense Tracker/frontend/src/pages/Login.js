import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { TrendingUp as ChartIcon } from '@mui/icons-material';
import { loginUser, registerUser } from '../features/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(registerUser(formData));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233, 69, 96, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%)',
          filter: 'blur(100px)',
        },
      }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Side - Branding */}
        <Grid 
          item 
          xs={false} 
          md={6} 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: 6,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <ChartIcon sx={{ fontSize: 120, color: 'primary.main', mb: 4, filter: 'drop-shadow(0 8px 24px rgba(233, 69, 96, 0.3))' }} />
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                color: 'white', 
                mb: 3,
                background: 'linear-gradient(135deg, #e94560, #00d4aa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.04em',
              }}
            >
              NEXUS
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontWeight: 400,
                mb: 4,
                lineHeight: 1.4,
                letterSpacing: '0.02em',
              }}
            >
              Advanced Financial Intelligence Platform
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                lineHeight: 1.6,
                fontSize: '1.1rem',
              }}
            >
              Harness the power of predictive analytics and real-time insights 
              to optimize your financial ecosystem
            </Typography>
          </Box>
        </Grid>

        {/* Right Side - Form */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              backdropFilter: 'blur(40px)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              width: '100%',
              maxWidth: 480,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(233, 69, 96, 0.5), transparent)',
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  color: 'white',
                  fontSize: '2rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {isLogin ? 'Access Portal' : 'Initialize Account'}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1.05rem',
                  fontWeight: 400,
                }}
              >
                {isLogin 
                  ? 'Authenticate your credentials to continue' 
                  : 'Configure your access parameters'}
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 71, 87, 0.15)',
                  border: '1px solid rgba(255, 71, 87, 0.3)',
                  color: '#ff6b88',
                  '& .MuiAlert-icon': {
                    color: '#ff6b88',
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="System Identifier"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(233, 69, 96, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#e94560',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
                
                <TextField
                  fullWidth
                  label="Access Credentials"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(233, 69, 96, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e94560',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Security Key"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(233, 69, 96, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e94560',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ 
                    mt: 2,
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    letterSpacing: '0.025em',
                    textTransform: 'uppercase',
                    boxShadow: '0 8px 24px rgba(233, 69, 96, 0.35)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff6b88, #e94560)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(233, 69, 96, 0.45)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : (
                    isLogin ? 'Authenticate' : 'Initialize'
                  )}
                </Button>
              </Box>
            </form>

            <Divider 
              sx={{ 
                my: 4,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&::before, &::after': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }
              }} 
            />

            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  mb: 1,
                  fontSize: '0.95rem',
                }}
              >
                {isLogin ? "Haven't configured access yet?" : 'Access already configured?'}
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(!isLogin);
                }}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#00d4aa',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#33e4c4',
                    textDecoration: 'underline',
                  }
                }}
              >
                {isLogin ? 'Initialize New Account' : 'Access Existing Portal'}
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;