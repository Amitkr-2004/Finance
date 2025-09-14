import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  CurrencyRupee as CurrencyIcon, 
  Close as TerminateIcon,
  Save as CommitIcon,
  Edit as ModifyIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { createTransaction, updateTransaction } from '../features/transactions/transactionSlice';

const categories = {
  income: [
    'Primary Income', 'Contract Work', 'Investment Returns', 'Property Revenue', 'Business Profit',
    'Monetary Gift', 'Performance Bonus', 'Interest Yield', 'Dividend Payment', 'Misc Income'
  ],
  expense: [
    'Nutrition & Dining', 'Mobility Services', 'Retail Purchases', 'Leisure Activities', 'Utility Payments',
    'Medical Services', 'Learning & Development', 'Journey Expenses', 'Accommodation', 'Protection Plans', 'Supply Procurement',
    'Energy Costs', 'Network Services', 'Communication', 'Wardrobe', 'Personal Maintenance', 'Other Expenses'
  ]
};

const TransactionForm = ({ open, onClose, editData = null, viewMode = false }) => {
  const dispatch = useDispatch();
  const { error, isLoading } = useSelector((state) => state.transactions);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: dayjs(),
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount?.toString() || '',
        type: editData.type || 'expense',
        category: editData.category || '',
        description: editData.description || '',
        date: editData.date ? dayjs(editData.date) : dayjs(),
      });
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: dayjs(),
      });
    }
    setErrors({});
    setTouched({});
  }, [editData, open]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          newErrors.amount = 'Value must exceed zero threshold';
        } else if (parseFloat(value) > 10000000) {
          newErrors.amount = 'Value exceeds maximum system limit';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'type':
        if (!value) {
          newErrors.type = 'Transaction type selection required';
        } else {
          delete newErrors.type;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'Classification parameter required';
        } else {
          delete newErrors.category;
        }
        break;
      case 'description':
        if (value && value.length > 500) {
          newErrors.description = 'Description exceeds character limit (500)';
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fieldsToValidate = ['amount', 'type', 'category'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const transactionData = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description.trim(),
      date: formData.date.toISOString(),
    };

    try {
      if (editData) {
        await dispatch(updateTransaction({ id: editData._id, data: transactionData })).unwrap();
      } else {
        await dispatch(createTransaction(transactionData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Transaction operation failed:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: dayjs(),
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'type') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4,
            background: 'rgba(16, 16, 24, 0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(233, 69, 96, 0.2)',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {editData ? <ModifyIcon sx={{ mr: 2, color: '#ffa502', fontSize: '1.5rem' }} /> : <CurrencyIcon sx={{ mr: 2, color: '#e94560', fontSize: '1.5rem' }} />}
              <Box>
                <Typography 
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    fontSize: '1.5rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  {viewMode ? 'Transaction Inspection' : editData ? 'Data Modification' : 'New Entry Creation'}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {viewMode ? 'System data review' : editData ? 'Modify existing record' : 'Input financial data'}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleClose} 
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#ff4757',
                  backgroundColor: 'rgba(255, 71, 87, 0.1)',
                }
              }}
            >
              <TerminateIcon />
            </IconButton>
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 4 }}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
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
                  </motion.div>
                )}
              </AnimatePresence>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monetary Value"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange('amount')}
                    onBlur={handleBlur('amount')}
                    error={!!errors.amount}
                    helperText={errors.amount}
                    disabled={viewMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyIcon sx={{ color: '#e94560' }} />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01, max: 10000000 }
                    }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
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
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}>
                      Flow Direction *
                    </InputLabel>
                    <Select
                      value={formData.type}
                      onChange={handleChange('type')}
                      onBlur={handleBlur('type')}
                      label="Flow Direction *"
                      disabled={viewMode}
                      required
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(233, 69, 96, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e94560',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        }
                      }}
                    >
                      <MenuItem value="income" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        <Chip label="IN" color="success" size="small" sx={{ mr: 2, fontWeight: 700 }} />
                        Inflow Stream
                      </MenuItem>
                      <MenuItem value="expense" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        <Chip label="OUT" color="error" size="small" sx={{ mr: 2, fontWeight: 700 }} />
                        Outflow Stream
                      </MenuItem>
                    </Select>
                    {errors.type && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, fontSize: '0.85rem', fontWeight: 500 }}>
                        {errors.type}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}>
                      Classification *
                    </InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleChange('category')}
                      onBlur={handleBlur('category')}
                      label="Classification *"
                      disabled={!formData.type || viewMode}
                      required
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(233, 69, 96, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e94560',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        }
                      }}
                    >
                      {formData.type && categories[formData.type].map((category) => (
                        <MenuItem key={category} value={category} sx={{ fontSize: '1rem', fontWeight: 500 }}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, fontSize: '0.85rem', fontWeight: 500 }}>
                        {errors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Temporal Marker"
                    value={formData.date}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                    disabled={viewMode}
                    renderInput={(params) => 
                      <TextField 
                        {...params} 
                        fullWidth 
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
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
                            fontSize: '1rem',
                            fontWeight: 500,
                          },
                          '& .MuiOutlinedInput-input': {
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                          },
                        }}
                      />
                    }
                    maxDateTime={dayjs()}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes (Optional)"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={!!errors.description}
                    helperText={errors.description || `${formData.description.length}/500 characters`}
                    disabled={viewMode}
                    placeholder="Enter contextual information about this transaction..."
                    inputProps={{ maxLength: 500 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
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
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            {!viewMode && (
              <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button 
                  onClick={handleClose} 
                  disabled={isLoading}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    }
                  }}
                >
                  Abort
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    disabled={isLoading || Object.keys(errors).length > 0}
                    startIcon={<CommitIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '0.025em',
                      textTransform: 'uppercase',
                      boxShadow: '0 8px 24px rgba(233, 69, 96, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff6b88, #e94560)',
                        boxShadow: '0 12px 32px rgba(233, 69, 96, 0.45)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    {isLoading ? 'Processing...' : editData ? 'Commit Changes' : 'Execute Entry'}
                  </Button>
                </motion.div>
              </DialogActions>
            )}
          </form>
        </motion.div>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TransactionForm;