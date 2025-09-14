import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Analytics as AnalyticsIcon,
  Assessment,
  Savings,
  AccountBalanceWallet,
  Receipt,
  CalendarToday,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { fetchTransactions } from '../features/transactions/transactionSlice';

// Currency formatter for rupees
const formatCurrency = (value) => `₹${Math.abs(value || 0).toLocaleString('en-IN')}`;

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ 
        p: 2, 
        border: '1px solid rgba(233, 69, 96, 0.2)', 
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Enhanced Statistics Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend = null }) => {
  const getGradientColors = (color) => {
    switch (color) {
      case 'success':
        return 'linear-gradient(135deg, #00d4aa, #33e4c4)';
      case 'error':
        return 'linear-gradient(135deg, #ff4757, #ff6b88)';
      case 'primary':
        return 'linear-gradient(135deg, #e94560, #ff6b88)';
      case 'warning':
        return 'linear-gradient(135deg, #ffa502, #ffb638)';
      case 'info':
        return 'linear-gradient(135deg, #3742fa, #5352ed)';
      default:
        return 'linear-gradient(135deg, #747d8c, #a4b0be)';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ 
        borderRadius: 4, 
        height: '100%', 
        background: getGradientColors(color),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}>
        <CardContent sx={{ color: 'white', p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ 
                opacity: 0.9, 
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: 'white',
                fontSize: '1.8rem',
                letterSpacing: '-0.02em',
                mt: 0.5
              }}>
                {formatCurrency(value)}
              </Typography>
            </Box>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 3, 
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)'
            }}>
              {React.cloneElement(icon, { sx: { fontSize: 28 } })}
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ opacity: 0.8, color: 'white', mb: 1 }}>
            {subtitle}
          </Typography>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend > 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {Math.abs(trend).toFixed(1)}% from previous period
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { data: transactions, isLoading, error } = useSelector((state) => state.transactions);
  
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day'),
    endDate: dayjs(),
  });
  const [filteredData, setFilteredData] = useState({
    transactions: [],
    statistics: {},
    chartData: [],
    categoryData: [],
  });

  // Fetch transactions on component mount
  useEffect(() => {
    handleDateRangeSubmit();
  }, [dispatch]);

  // Filter and analyze data when date range changes
  const handleDateRangeSubmit = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (dateRange.startDate.isAfter(dateRange.endDate)) {
      alert('Start date cannot be after end date');
      return;
    }

    // Fetch transactions for the selected date range
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };
    
    dispatch(fetchTransactions(params));
  };

  // Analyze data when transactions change
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      analyzeTransactionData();
    } else {
      // Reset data if no transactions
      setFilteredData({
        transactions: [],
        statistics: {
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          averageExpenditure: 0,
          transactionCount: 0,
          avgDailySpending: 0,
          highestExpense: 0,
          highestIncome: 0,
        },
        chartData: [],
        categoryData: [],
      });
    }
  }, [transactions]);

  const analyzeTransactionData = () => {
    // Calculate basic statistics
    const stats = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
        acc.highestIncome = Math.max(acc.highestIncome, amount);
      } else if (transaction.type === 'expense') {
        acc.totalExpenses += amount;
        acc.highestExpense = Math.max(acc.highestExpense, amount);
      }
      acc.transactionCount++;
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      highestIncome: 0,
      highestExpense: 0,
      transactionCount: 0,
    });

    // Calculate derived statistics
    stats.totalSavings = stats.totalIncome - stats.totalExpenses;
    stats.averageExpenditure = stats.totalExpenses / (stats.transactionCount > 0 ? stats.transactionCount : 1);
    
    // Calculate average daily spending
    const daysDiff = dateRange.endDate.diff(dateRange.startDate, 'day') + 1;
    stats.avgDailySpending = stats.totalExpenses / daysDiff;

    // Prepare daily chart data
    const dailyData = {};
    
    // Initialize all days in range with 0 values
    for (let d = dayjs(dateRange.startDate); d.isBefore(dateRange.endDate) || d.isSame(dateRange.endDate, 'day'); d = d.add(1, 'day')) {
      const dateKey = d.format('YYYY-MM-DD');
      dailyData[dateKey] = {
        date: d.format('MMM DD'),
        income: 0,
        expenses: 0,
        net: 0,
      };
    }

    // Fill in actual transaction data
    transactions.forEach(transaction => {
      const date = dayjs(transaction.date).format('YYYY-MM-DD');
      const amount = parseFloat(transaction.amount) || 0;
      
      if (dailyData[date]) {
        if (transaction.type === 'income') {
          dailyData[date].income += amount;
        } else if (transaction.type === 'expense') {
          dailyData[date].expenses += amount;
        }
        dailyData[date].net = dailyData[date].income - dailyData[date].expenses;
      }
    });

    const chartData = Object.values(dailyData).sort((a, b) => 
      dayjs(a.date, 'MMM DD').valueOf() - dayjs(b.date, 'MMM DD').valueOf()
    );

    // Prepare category data for pie chart
    const categoryBreakdown = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Other';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (parseFloat(transaction.amount) || 0);
      }
    });

    const categoryData = Object.entries(categoryBreakdown)
      .map(([name, value], index) => ({
        name,
        value,
        color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'][index % 8]
      }))
      .sort((a, b) => b.value - a.value);

    setFilteredData({
      transactions,
      statistics: stats,
      chartData,
      categoryData,
    });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: dayjs().subtract(30, 'day'),
      endDate: dayjs(),
    });
  };

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          Error loading transactions: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Enhanced Main Container */}
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
              <AnalyticsIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: theme.palette.text.primary,
                fontSize: '2.4rem',
                letterSpacing: '-0.02em',
                mb: 0.5
              }}>
                Financial Analytics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                fontSize: '1.1rem'
              }}>
                Comprehensive Data Analysis & Insights
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Enhanced Date Range Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Paper sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarToday sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                fontSize: '1.3rem'
              }}>
                Analysis Period Configuration
              </Typography>
            </Box>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="From Date"
                  value={dateRange.startDate}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        } 
                      }}
                    />
                  )}
                  maxDate={dayjs()}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="To Date"
                  value={dateRange.endDate}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        } 
                      }}
                    />
                  )}
                  maxDate={dayjs()}
                  minDate={dateRange.startDate}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      onClick={handleDateRangeSubmit}
                      disabled={isLoading}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: '0 6px 20px rgba(233, 69, 96, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ff6b88, #e94560)',
                          boxShadow: '0 8px 25px rgba(233, 69, 96, 0.4)',
                        }
                      }}
                      startIcon={<Assessment />}
                    >
                      {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                    </Button>
                  </motion.div>
                  
                  <Button
                    variant="outlined"
                    onClick={resetDateRange}
                    sx={{ 
                      px: 3, 
                      py: 1.5, 
                      borderRadius: 3,
                      borderColor: theme.palette.text.secondary,
                      color: theme.palette.text.secondary,
                      '&:hover': { 
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ 
              mt: 3, 
              color: theme.palette.text.secondary,
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }}>
              Period: {dateRange.startDate?.format('MMM DD, YYYY')} to {dateRange.endDate?.format('MMM DD, YYYY')} 
              ({dateRange.endDate?.diff(dateRange.startDate, 'day') + 1} days analysis)
            </Typography>
          </Paper>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6" color="text.secondary">
                  Processing Financial Data...
                </Typography>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Enhanced Statistics Cards */}
        {!isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Total Income"
                    value={filteredData.statistics.totalIncome}
                    icon={<TrendingUp />}
                    color="success"
                    subtitle={`Peak: ${formatCurrency(filteredData.statistics.highestIncome)}`}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Total Expenses"
                    value={filteredData.statistics.totalExpenses}
                    icon={<TrendingDown />}
                    color="error"
                    subtitle={`Peak: ${formatCurrency(filteredData.statistics.highestExpense)}`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Net Balance"
                    value={filteredData.statistics.totalSavings}
                    icon={<Savings />}
                    color={filteredData.statistics.totalSavings >= 0 ? "primary" : "warning"}
                    subtitle={filteredData.statistics.totalSavings >= 0 ? "Positive Flow" : "Negative Flow"}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Daily Average"
                    value={filteredData.statistics.avgDailySpending}
                    icon={<AccountBalanceWallet />}
                    color="info"
                    subtitle={`${filteredData.statistics.transactionCount} total transactions`}
                  />
                </Grid>
              </Grid>
            </motion.div>

            {/* Enhanced Additional Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper sx={{ 
                p: 4, 
                mb: 5, 
                borderRadius: 4,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}>
                <Typography variant="h5" sx={{ 
                  mb: 4, 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  fontSize: '1.4rem'
                }}>
                  Performance Metrics
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 212, 170, 0.05))'
                        : 'linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(0, 212, 170, 0.03))',
                      border: '1px solid rgba(0, 212, 170, 0.2)'
                    }}>
                      <Typography variant="overline" sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        letterSpacing: '0.1em'
                      }}>
                        Avg Transaction Value
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        color: '#00d4aa',
                        mt: 1
                      }}>
                        {formatCurrency(filteredData.statistics.averageExpenditure)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(233, 69, 96, 0.1), rgba(233, 69, 96, 0.05))'
                        : 'linear-gradient(135deg, rgba(233, 69, 96, 0.08), rgba(233, 69, 96, 0.03))',
                      border: '1px solid rgba(233, 69, 96, 0.2)'
                    }}>
                      <Typography variant="overline" sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        letterSpacing: '0.1em'
                      }}>
                        Savings Rate
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        color: '#e94560',
                        mt: 1
                      }}>
                        {filteredData.statistics.totalIncome > 0 
                          ? `${((filteredData.statistics.totalSavings / filteredData.statistics.totalIncome) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            {/* Enhanced Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Grid container spacing={4}>
                {/* Daily Trend Line Chart */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.08)',
                    height: 500
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: theme.palette.text.primary,
                      fontSize: '1.2rem'
                    }}>
                      Financial Flow Analysis
                    </Typography>
                    
                    {filteredData.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={filteredData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => `₹${Math.abs(value).toLocaleString('en-IN')}`}
                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#00d4aa"
                            strokeWidth={4}
                            dot={{ fill: '#00d4aa', r: 6, strokeWidth: 2, stroke: '#fff' }}
                            name="Income Stream"
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ff4757"
                            strokeWidth={4}
                            dot={{ fill: '#ff4757', r: 6, strokeWidth: 2, stroke: '#fff' }}
                            name="Expense Flow"
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="net"
                            stroke="#3742fa"
                            strokeWidth={3}
                            strokeDasharray="8 4"
                            dot={{ fill: '#3742fa', r: 4 }}
                            name="Net Balance"
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Receipt sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Financial Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Please select a different date range or add transactions
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Category Breakdown */}
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    height: 500,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.08)',
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: theme.palette.text.primary,
                      fontSize: '1.2rem'
                    }}>
                      Category Distribution
                    </Typography>
                    
                    {filteredData.categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={filteredData.categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {filteredData.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body2" color="text.secondary">
                          No expense categories to analyze
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Summary Bar Chart */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(233, 69, 96, 0.15)' : 'rgba(200, 200, 200, 0.3)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.08)',
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: theme.palette.text.primary,
                      fontSize: '1.2rem'
                    }}>
                      Financial Summary Overview
                    </Typography>
                    
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[{
                        name: 'Period Analysis',
                        Income: filteredData.statistics.totalIncome,
                        Expenses: filteredData.statistics.totalExpenses,
                        'Net Savings': filteredData.statistics.totalSavings,
                      }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'} />
                        <XAxis dataKey="name" tick={{ fontSize: 14, fill: theme.palette.text.secondary }} />
                        <YAxis tickFormatter={(value) => `₹${Math.abs(value).toLocaleString('en-IN')}`} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="Income" fill="#00d4aa" name="Total Income" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#ff4757" name="Total Expenses" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Net Savings" fill="#3742fa" name="Net Balance" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;
