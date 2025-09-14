import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  Fade,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  Description as PdfIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as AIIcon,
  Refresh as RefreshIcon,
  BugReport as DebugIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAPI, transactionAPI } from '../services/api';
import { fetchTransactions } from '../features/transactions/transactionSlice';
import { FadeIn, SlideIn, AnimatedCard } from '../components/Animations/AnimatedComponents';

const Upload = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Expense table state
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [updateLoading, setUpdateLoading] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    needsReviewCount: 0,
    totalItems: 0
  });

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [expenses, filter, sortBy, sortOrder]);

  const loadExpenses = async () => {
    try {
      setTableLoading(true);
      console.log('🔄 Loading expenses from API...');
      
      const response = await transactionAPI.getAll();
      console.log('📥 API Response:', response.data);
      
      if (response.data.success) {
        const transactionData = response.data.data || response.data.transactions || [];
        console.log(`📊 Loaded ${transactionData.length} transactions`);
        
        // Enhanced validation for each transaction
        const validatedTransactions = transactionData.map(transaction => {
          const validatedTransaction = {
            ...transaction,
            date: transaction.date ? new Date(transaction.date) : new Date(),
            amount: transaction.amount ? parseFloat(transaction.amount) : null,
            category: transaction.category || 'Other Expense',
            description: transaction.description || 'No description',
            needsManualReview: transaction.needsManualReview || 
                              !transaction.amount || 
                              transaction.amount === 0 ||
                              !transaction.category ||
                              transaction.category === 'Unknown'
          };
          
          if (validatedTransaction.needsManualReview) {
            console.log('🚨 Transaction needs review:', {
              id: transaction._id,
              description: validatedTransaction.description,
              amount: validatedTransaction.amount,
              reason: !transaction.amount ? 'No amount' : 
                     transaction.amount === 0 ? 'Zero amount' :
                     !transaction.category ? 'No category' : 'Other validation issue'
            });
          }
          
          return validatedTransaction;
        });
        
        setExpenses(validatedTransactions);
        calculateStats(validatedTransactions);
      } else {
        console.warn('⚠️ API returned success: false');
        setExpenses([]);
      }
    } catch (error) {
      console.error('❌ Error loading expenses:', error);
      setNotification({
        open: true,
        message: 'Failed to load expenses: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      setExpenses([]);
    } finally {
      setTableLoading(false);
    }
  };

  const calculateStats = (transactionData) => {
    const totalIncome = transactionData
      .filter(exp => exp.type === 'income' && exp.amount > 0)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalExpenses = transactionData
      .filter(exp => exp.type === 'expense' && exp.amount > 0)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const needsReviewCount = transactionData
      .filter(exp => exp.needsManualReview || !exp.amount || exp.amount === 0)
      .length;

    setStats({
      totalIncome,
      totalExpenses,
      needsReviewCount,
      totalItems: transactionData.length
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...expenses];

    // Apply filter
    if (filter === 'income') {
      filtered = filtered.filter(exp => exp.type === 'income');
    } else if (filter === 'expense') {
      filtered = filtered.filter(exp => exp.type === 'expense');
    } else if (filter === 'needs-fix') {
      filtered = filtered.filter(exp => exp.needsManualReview || !exp.amount || exp.amount === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'amount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  };

  // Enhanced file upload handler for receipts
  const handleReceiptUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setNotification({
        open: true,
        message: '❌ Please select a valid image file (JPG, PNG, GIF)',
        severity: 'error'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotification({
        open: true,
        message: '❌ File size must be less than 10MB',
        severity: 'error'
      });
      return;
    }

    setUploading(true);
    setProcessingStage('📤 Uploading image to server...');
    setProcessingProgress(10);
    setDebugInfo(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProcessingStage('🔍 Enhanced OCR processing with multiple passes...');
      setProcessingProgress(30);

      console.log('📤 Starting enhanced upload for:', file.name);
      const response = await uploadAPI.uploadReceipt(formData);
      console.log('✅ Upload response:', response.data);

      setProcessingStage('🤖 AI parsing with Google Gemini 1.5 Flash...');
      setProcessingProgress(60);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingStage('💾 Saving validated data to database...');
      setProcessingProgress(85);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingProgress(100);

      const result = response.data;
      if (result.success) {
        let processedCount = 0;
        let needsReviewCount = 0;
        
        if (result.expenses && result.expenses.length > 0) {
          processedCount = result.expenses.length;
          needsReviewCount = result.stats?.needsManualAmount || 0;
        }

        // Store debug information
        setDebugInfo({
          ocrMethod: result.stats?.ocrMethod || 'Unknown',
          parsingMethod: result.stats?.parsingMethod || 'Unknown',
          textLength: result.stats?.textLength || 0,
          processingTime: result.stats?.processingTime || 0,
          ocrPreview: result.ocrPreview || '',
          rawOcrText: result.rawOcrText || '',
          fileUrl: result.fileUrl
        });

        // Add to upload history
        setUploadResults(prev => [...prev, {
          id: Date.now(),
          type: 'receipt',
          filename: file.name,
          status: 'success',
          message: `Processed ${processedCount} expense(s)`,
          fileUrl: result.fileUrl,
          stats: result.stats,
          expenses: result.expenses,
          timestamp: new Date().toISOString()
        }]);

        // Refresh the expenses list
        await loadExpenses();
        dispatch(fetchTransactions());

        // Show detailed success message
        let message = `🎉 Receipt processed successfully!`;
        if (processedCount > 0) {
          message += ` Found ${processedCount} expense(s).`;
          if (needsReviewCount > 0) {
            message += ` ${needsReviewCount} need manual review.`;
          }
        }

        setNotification({
          open: true,
          message: message,
          severity: processedCount > 0 ? 'success' : 'warning'
        });

      } else {
        throw new Error(result.message || 'Processing failed');
      }

    } catch (error) {
      console.error('❌ Receipt upload error:', error);
      
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'receipt',
        filename: file.name,
        status: 'error',
        message: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      }]);

      setNotification({
        open: true,
        message: `❌ Receipt upload failed: ${error.response?.data?.error || error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setProcessingStage('');
      setProcessingProgress(0);
      event.target.value = '';
    }
  }, [dispatch]);

  // Enhanced file upload handler for bank statements
  const handleStatementUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setNotification({
        open: true,
        message: '❌ Please select a valid PDF file',
        severity: 'error'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotification({
        open: true,
        message: '❌ File size must be less than 10MB',
        severity: 'error'
      });
      return;
    }

    setUploading(true);
    setProcessingStage('📤 Uploading PDF to server...');
    setProcessingProgress(10);
    setDebugInfo(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProcessingStage('📄 Enhanced PDF text extraction...');
      setProcessingProgress(40);

      const response = await uploadAPI.uploadBankStatement(formData);
      console.log('✅ Bank statement response:', response.data);

      setProcessingStage('🤖 AI parsing transactions...');
      setProcessingProgress(70);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingStage('💾 Saving to database...');
      setProcessingProgress(90);

      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(100);

      const result = response.data;
      if (result.success) {
        const processedCount = result.transactions?.length || 0;
        const needsReviewCount = result.stats?.needsManualAmount || 0;

        // Store debug information
        setDebugInfo({
          extractionMethod: result.stats?.extractionMethod || 'Unknown',
          parsingMethod: result.stats?.parsingMethod || 'Unknown',
          textLength: result.rawOcrText?.length || 0,
          processingTime: result.stats?.processingTime || 0,
          ocrPreview: result.ocrPreview || '',
          rawOcrText: result.rawOcrText || '',
          fileUrl: result.fileUrl
        });

        // Add to upload history
        setUploadResults(prev => [...prev, {
          id: Date.now(),
          type: 'statement',
          filename: file.name,
          status: 'success',
          message: `Imported ${processedCount} transaction(s)`,
          fileUrl: result.fileUrl,
          stats: result.stats,
          transactions: result.transactions,
          timestamp: new Date().toISOString()
        }]);

        // Refresh the expenses list
        await loadExpenses();
        dispatch(fetchTransactions());

        setNotification({
          open: true,
          message: `🏦 Bank statement processed! Imported ${processedCount} transaction(s).${needsReviewCount > 0 ? ` ${needsReviewCount} need review.` : ''}`,
          severity: 'success'
        });
      }

    } catch (error) {
      console.error('❌ Statement upload error:', error);
      
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'statement',
        filename: file.name,
        status: 'error',
        message: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      }]);

      setNotification({
        open: true,
        message: `❌ Bank statement upload failed: ${error.response?.data?.error || error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setProcessingStage('');
      setProcessingProgress(0);
      event.target.value = '';
    }
  }, [dispatch]);

  // Enhanced expense management functions
  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditingValues({
      amount: expense.amount || '',
      category: expense.category,
      description: expense.description
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editingValues.amount || editingValues.amount <= 0) {
      setNotification({
        open: true,
        message: 'Please enter a valid amount greater than 0',
        severity: 'warning'
      });
      return;
    }

    setUpdateLoading(id);
    try {
      const response = await transactionAPI.update(id, {
        ...editingValues,
        amount: parseFloat(editingValues.amount),
        needsManualReview: false
      });
      
      if (response.data.success) {
        // Refresh the list
        await loadExpenses();
        setEditingId(null);
        setEditingValues({});
        
        // Success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #d4edda; 
          color: #155724; padding: 15px; border-radius: 8px; z-index: 1000;
          border: 1px solid #c3e6cb; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-family: system-ui, sans-serif;
        `;
        notification.innerHTML = `
          <strong>✅ Updated Successfully!</strong><br>
          ${editingValues.category} - ₹${editingValues.amount}
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);

        dispatch(fetchTransactions());
      }
    } catch (error) {
      console.error('❌ Update failed:', error);
      setNotification({
        open: true,
        message: `Failed to update expense: ${error.response?.data?.error || error.message}`,
        severity: 'error'
      });
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const handleDelete = async (expense) => {
    const confirmMessage = `Are you sure you want to delete this expense?\n\n` +
      `Date: ${new Date(expense.date).toLocaleDateString()}\n` +
      `Category: ${expense.category}\n` +
      `Amount: ₹${expense.amount || 'N/A'}`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(expense._id);
    
    try {
      await transactionAPI.delete(expense._id);
      await loadExpenses(); // Refresh the list
      dispatch(fetchTransactions());
      
      setNotification({
        open: true,
        message: 'Expense deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Delete failed:', error);
      setNotification({
        open: true,
        message: `Failed to delete expense: ${error.response?.data?.error || error.message}`,
        severity: 'error'
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
    'Groceries', 'Other Expense', 'Income'
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      transition: 'background-color 0.4s ease',
      ...(theme.palette.mode === 'light' && {
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(233, 69, 96, 0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 212, 170, 0.07) 0%, transparent 50%)',
      }),
      p: 4,
    }}>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #e94560, #ff6b88)',
            mr: 3,
            boxShadow: '0 8px 24px rgba(233, 69, 96, 0.3)'
          }}>
            <UploadIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              color: theme.palette.text.primary,
              fontSize: '2.4rem',
              letterSpacing: '-0.02em',
              mb: 0.5
            }}>
              Intelligent File Upload
            </Typography>
            <Typography variant="h6" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 400,
              fontSize: '1.1rem'
            }}>
              Advanced OCR & AI-powered expense extraction
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Enhanced Upload Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                borderRadius: 4, 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <motion.div
                    animate={uploading ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 2, repeat: uploading ? Infinity : 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                      display: 'inline-block',
                      boxShadow: '0 8px 24px rgba(233, 69, 96, 0.3)'
                    }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                  </motion.div>
                  
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
                    Receipt Images
                  </Typography>
                  
                  <Box sx={{ mb: 3, flexGrow: 1 }}>
                    <Paper sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #00d4aa, #33e4c4)',
                      color: 'white',
                      borderRadius: 3,
                      mb: 3,
                      boxShadow: '0 6px 20px rgba(0, 212, 170, 0.3)'
                    }}>
                      <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: '0.1em' }}>
                        Supported Formats
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                        JPG • PNG • GIF • WEBP
                      </Typography>
                    </Paper>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      Multi-pass OCR with Google Gemini AI parsing for maximum accuracy
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="receipt-upload"
                      type="file"
                      onChange={handleReceiptUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="receipt-upload">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<UploadIcon />}
                          size="large"
                          disabled={uploading}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 6px 20px rgba(233, 69, 96, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #ff6b88, #e94560)',
                              boxShadow: '0 8px 25px rgba(233, 69, 96, 0.4)',
                            }
                          }}
                        >
                          {uploading ? 'Processing...' : 'Select Receipt Image'}
                        </Button>
                      </motion.div>
                    </label>

                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                      Maximum file size: 10MB
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
              <Card sx={{ 
                borderRadius: 4, 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <motion.div
                    animate={uploading ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 1.5, repeat: uploading ? Infinity : 0 }}
                    style={{ marginBottom: 24 }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                      display: 'inline-block',
                      boxShadow: '0 8px 24px rgba(55, 66, 250, 0.3)'
                    }}>
                      <PdfIcon sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                  </motion.div>
                  
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
                    PDF Statements
                  </Typography>
                  
                  <Box sx={{ mb: 3, flexGrow: 1 }}>
                    <Paper sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                      color: 'white',
                      borderRadius: 3,
                      mb: 3,
                      boxShadow: '0 6px 20px rgba(55, 66, 250, 0.3)'
                    }}>
                      <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: '0.1em' }}>
                        Supported Format
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                        PDF
                      </Typography>
                    </Paper>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      Google Vision API with intelligent transaction pattern recognition
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <input
                      accept=".pdf"
                      style={{ display: 'none' }}
                      id="statement-upload"
                      type="file"
                      onChange={handleStatementUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="statement-upload">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<UploadIcon />}
                          size="large"
                          disabled={uploading}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 6px 20px rgba(55, 66, 250, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5352ed, #3742fa)',
                              boxShadow: '0 8px 25px rgba(55, 66, 250, 0.4)',
                            }
                          }}
                        >
                          {uploading ? 'Processing...' : 'Select PDF Statement'}
                        </Button>
                      </motion.div>
                    </label>

                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                      Maximum file size: 10MB
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      {/* Enhanced Processing Status */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Paper sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 4,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(0, 212, 170, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 212, 170, 0.2)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Avatar sx={{ bgcolor: 'success.main', mr: 3, width: 56, height: 56 }}>
                    <AIIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </motion.div>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: '1.2rem'
                  }}>
                    {processingStage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Advanced AI processing pipeline in progress...
                  </Typography>
                </Box>
                <Chip 
                  label={`${processingProgress}%`} 
                  color="success" 
                  variant="filled"
                  sx={{ fontSize: '1rem', fontWeight: 700, px: 2 }}
                />
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={processingProgress}
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 212, 170, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #00d4aa, #33e4c4)',
                  }
                }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Debug Information Panel */}
      {debugInfo && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Paper sx={{ 
            mb: 4, 
            borderRadius: 4, 
            overflow: 'hidden',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #3742fa, #5352ed)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DebugIcon sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Processing Analytics
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
              >
                {showDebugInfo ? 'Hide Details' : 'Show Details'}
              </Button>
            </Box>
            
            <Collapse in={showDebugInfo}>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                      Processing Statistics
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        OCR Method: <span style={{ color: theme.palette.primary.main }}>{debugInfo.ocrMethod || debugInfo.extractionMethod}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Parsing Method: <span style={{ color: theme.palette.primary.main }}>{debugInfo.parsingMethod || 'PDF Processing'}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Text Length: <span style={{ color: theme.palette.primary.main }}>{debugInfo.textLength} characters</span>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Processing Time: <span style={{ color: theme.palette.primary.main }}>{debugInfo.processingTime}ms</span>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                      Extracted Text Preview
                    </Typography>
                    <Paper sx={{ 
                      p: 3, 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      maxHeight: 200, 
                      overflow: 'auto',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary }}>
                        {debugInfo.ocrPreview || 'No preview available'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {debugInfo.fileUrl && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                      Uploaded File
                    </Typography>
                    <a 
                      href={debugInfo.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Chip 
                          icon={<ViewIcon />}
                          label="View Original File in Cloudinary"
                          clickable
                          color="primary"
                          sx={{ fontSize: '0.9rem', py: 2, px: 1 }}
                        />
                      </motion.div>
                    </a>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        </motion.div>
      )}

      {/* Enhanced Expenses Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Paper sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}>
          {/* Enhanced Header */}
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #e94560, #ff6b88)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.8rem' }}>
                    Expense Management
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Review and manage your extracted transactions
                  </Typography>
                </Box>
              </Box>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={loadExpenses}
                  disabled={tableLoading}
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {tableLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Enhanced Manual Review Alert */}
          {stats.needsReviewCount > 0 && (
            <Box sx={{ p: 4, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 77, 87, 0.1)' : '#ffebee' }}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: 'transparent',
                  border: '2px solid #f44336',
                  '& .MuiAlert-icon': { fontSize: 28 }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Manual Review Required
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>{stats.needsReviewCount}</strong> transaction{stats.needsReviewCount > 1 ? 's' : ''} need your attention. 
                  The AI couldn't extract complete information from the uploaded documents.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${stats.needsReviewCount} Need Review`}
                    color="error"
                    variant="filled"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip 
                    label="Look for red-bordered rows"
                    color="error"
                    variant="outlined"
                  />
                </Box>
              </Alert>
            </Box>
          )}

          {/* Enhanced Controls */}
          <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                    Filter by Type
                  </Typography>
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                      color: theme.palette.text.primary,
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <option value="all">All Expenses</option>
                    <option value="expense">Expenses Only</option>
                    <option value="income">Income Only</option>
                    {stats.needsReviewCount > 0 && (
                      <option value="needs-fix">🚨 Needs Fix ({stats.needsReviewCount})</option>
                    )}
                  </select>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                    Sort by
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ 
                        flex: 1,
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                        color: theme.palette.text.primary,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                    </select>

                    <Button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      variant="outlined"
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
                    Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#f44336' }}>
                        ₹{stats.totalExpenses.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#4caf50' }}>
                        ₹{stats.totalIncome.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total Income</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                        {filteredExpenses.length} of {stats.totalItems} items
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Enhanced Table Content */}
          <Box sx={{ p: 4 }}>
            {tableLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ marginBottom: 24 }}
                >
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto' }}>
                    <RefreshIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </motion.div>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
                  Loading Transaction Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching your expense records from the database...
                </Typography>
              </Box>
            ) : filteredExpenses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>📊</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                  {expenses.length === 0 ? 'No expenses found' : 'No matching expenses'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {expenses.length === 0 
                    ? 'Upload a receipt or bank statement to get started with expense tracking!'
                    : 'Try adjusting your filters to see more results.'
                  }
                </Typography>
                {expenses.length === 0 && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <label htmlFor="receipt-upload">
                      <Button variant="contained" sx={{ px: 4, py: 1.5 }}>
                        📱 Upload Receipt
                      </Button>
                    </label>
                    <label htmlFor="statement-upload">
                      <Button variant="contained" color="secondary" sx={{ px: 4, py: 1.5 }}>
                        🏦 Upload PDF
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
            ) : (
              <>
                {/* Enhanced Responsive Table */}
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        background: 'linear-gradient(135deg, #1976d2, #1565c0)', 
                        color: 'white' 
                      }}>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '700', fontSize: '15px', minWidth: '120px' }}>
                          Date
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '700', fontSize: '15px', minWidth: '150px' }}>
                          Category
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '700', fontSize: '15px', minWidth: '100px' }}>
                          Type
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '700', fontSize: '15px', minWidth: '120px' }}>
                          Amount
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '700', fontSize: '15px', minWidth: '200px' }}>
                          Description
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '700', fontSize: '15px', minWidth: '100px' }}>
                          File
                        </th>
                        <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '700', fontSize: '15px', minWidth: '140px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense, index) => {
                        const isEditing = editingId === expense._id;
                        const needsFix = expense.needsManualReview || !expense.amount || expense.amount === 0;
                        
                        return (
                          <motion.tr 
                            key={expense._id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            style={{ 
                              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              backgroundColor: needsFix 
                                ? (theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.1)' : '#ffebee')
                                : (index % 2 === 0 
                                  ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa')
                                  : 'transparent'),
                              borderLeft: needsFix ? '6px solid #f44336' : '6px solid transparent',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {/* Date Column */}
                            <td style={{ padding: '16px 15px' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {expense.date 
                                  ? new Date(expense.date).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Invalid Date'
                                }
                              </Typography>
                              {needsFix && (
                                <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
                                  ⚠️ Review Required
                                </Typography>
                              )}
                            </td>
                            
                            {/* Category Column */}
                            <td style={{ padding: '16px 15px' }}>
                              {isEditing ? (
                                <select
                                  value={editingValues.category}
                                  onChange={(e) => setEditingValues({...editingValues, category: e.target.value})}
                                  style={{ 
                                    width: '100%', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    border: '3px solid #1976d2',
                                    borderRadius: '6px',
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: theme.palette.text.primary,
                                    fontWeight: '600'
                                  }}
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              ) : (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                    {expense.category || 'N/A'}
                                  </Typography>
                                  {expense.ocrMethod && (
                                    <Typography variant="caption" color="text.secondary">
                                      {expense.ocrMethod}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </td>
                            
                            {/* Type Column */}
                            <td style={{ padding: '16px 15px', textAlign: 'center' }}>
                              <Chip
                                label={expense.type === 'income' ? 'INCOME' : 'EXPENSE'}
                                color={expense.type === 'income' ? 'success' : 'error'}
                                variant="filled"
                                size="small"
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  minWidth: '80px'
                                }}
                              />
                            </td>
                            
                            {/* Amount Column */}
                            <td style={{ padding: '16px 15px', textAlign: 'right' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editingValues.amount}
                                  onChange={(e) => setEditingValues({...editingValues, amount: e.target.value})}
                                  style={{ 
                                    width: '110px', 
                                    padding: '10px',
                                    textAlign: 'right',
                                    border: '3px solid #1976d2',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: theme.palette.text.primary
                                  }}
                                  placeholder="0.00"
                                  autoFocus
                                />
                              ) : needsFix ? (
                                <Chip
                                  label="Enter Amount"
                                  color="error"
                                  variant="outlined"
                                  size="small"
                                  icon={<WarningIcon />}
                                />
                              ) : (
                                <Box>
                                  <Typography variant="body1" sx={{ 
                                    fontWeight: 800,
                                    color: expense.type === 'income' ? '#4caf50' : '#f44336',
                                    fontSize: '16px'
                                  }}>
                                    ₹{Number(expense.amount || 0).toLocaleString('en-IN')}
                                  </Typography>
                                  {expense.aiParsed && (
                                    <Typography variant="caption" color="text.secondary">
                                      🤖 AI Parsed
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </td>
                            
                            {/* Description Column */}
                            <td style={{ padding: '16px 15px', maxWidth: '220px' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingValues.description}
                                  onChange={(e) => setEditingValues({...editingValues, description: e.target.value})}
                                  style={{ 
                                    width: '100%', 
                                    padding: '10px',
                                    border: '3px solid #1976d2',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: theme.palette.text.primary
                                  }}
                                  placeholder="Enter description..."
                                />
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.text.secondary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} 
                                  title={expense.description}
                                >
                                  {expense.description || `${expense.category} ${expense.type}`}
                                </Typography>
                              )}
                            </td>
                            
                            {/* File Column */}
                            <td style={{ padding: '16px 15px', textAlign: 'center' }}>
                              {expense.fileUrl ? (
                                <a 
                                  href={expense.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Chip
                                    icon={<ViewIcon />}
                                    label="View"
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                </a>
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  No file
                                </Typography>
                              )}
                            </td>
                            
                            {/* Actions Column */}
                            <td style={{ padding: '16px 15px', textAlign: 'center' }}>
                              {isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <Button
                                    onClick={() => handleSaveEdit(expense._id)}
                                    disabled={updateLoading === expense._id}
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={updateLoading === expense._id ? <RefreshIcon /> : <SuccessIcon />}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <Button
                                    onClick={() => handleEdit(expense)}
                                    size="small"
                                    variant={needsFix ? "contained" : "outlined"}
                                    color={needsFix ? "error" : "primary"}
                                    startIcon={<EditIcon />}
                                  >
                                    {needsFix ? 'FIX' : 'Edit'}
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(expense)}
                                    disabled={deleteLoading === expense._id}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                  >
                                    {deleteLoading === expense._id ? '...' : 'Delete'}
                                  </Button>
                                </Box>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>

                {/* Enhanced Net Balance Summary */}
                <Box sx={{ 
                  mt: 4, 
                  p: 4, 
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(233, 69, 96, 0.1), rgba(0, 212, 170, 0.1))'
                    : 'linear-gradient(135deg, #f8f9ff, #ffffff)',
                  border: '2px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.2)' : 'rgba(233, 69, 96, 0.1)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800,
                    color: (stats.totalIncome - stats.totalExpenses) >= 0 ? '#4caf50' : '#f44336',
                    mb: 2
                  }}>
                    Net Balance: ₹{(stats.totalIncome - stats.totalExpenses).toLocaleString('en-IN')}
                  </Typography>
                  
                  <Grid container spacing={4} justifyContent="center" sx={{ mb: 2 }}>
                    <Grid item>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        ₹{stats.totalIncome.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        💰 Total Income
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                        ₹{stats.totalExpenses.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        💸 Total Expenses
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {stats.needsReviewCount > 0 && (
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                      ⚠️ Balance excludes {stats.needsReviewCount} transaction{stats.needsReviewCount > 1 ? 's' : ''} with missing amounts
                    </Alert>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Enhanced Upload History */}
      {uploadResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper sx={{ 
            mt: 4,
            borderRadius: 4, 
            overflow: 'hidden',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                📂 Upload History ({uploadResults.length})
              </Typography>
            </Box>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {uploadResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Box sx={{ 
                    p: 3, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {result.filename}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {result.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(result.timestamp).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                          <Chip 
                            label={result.type} 
                            size="small" 
                            color={result.type === 'receipt' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                          <Chip 
                            icon={result.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                            label={result.status} 
                            size="small" 
                            color={result.status === 'success' ? 'success' : 'error'}
                            variant="filled"
                          />
                          {result.fileUrl && (
                            <a 
                              href={result.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <Chip 
                                icon={<ViewIcon />}
                                label="View" 
                                size="small" 
                                clickable
                                variant="outlined"
                                color="primary"
                              />
                            </a>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Enhanced Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            minWidth: 400,
            borderRadius: 3,
            fontSize: '0.95rem',
            fontWeight: 600,
            '& .MuiAlert-icon': { fontSize: 24 }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Upload;
