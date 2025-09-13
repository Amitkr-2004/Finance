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
import dayjs from 'dayjs';
import { fetchTransactions } from '../features/transactions/transactionSlice';

// Currency formatter for rupees
const formatCurrency = (value) => `₹${Math.abs(value || 0).toLocaleString('en-IN')}`;

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, border: '1px solid #ccc', boxShadow: 2 }}>
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

// Statistics Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend = null }) => (
  <Card sx={{ borderRadius: 3, height: '100%', background: `linear-gradient(135deg, ${color}.main, ${color}.light)` }}>
    <CardContent sx={{ color: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1, opacity: 0.9 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {formatCurrency(value)}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        {subtitle}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend > 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
          <Typography variant="caption">
            {Math.abs(trend).toFixed(1)}% from previous period
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const dispatch = useDispatch();
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading transactions: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
          Financial Analytics Dashboard
        </Typography>

        {/* Date Range Selection Form */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
            Select Analysis Period
          </Typography>
          
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
                        backgroundColor: 'white',
                        borderRadius: 2 
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
                        backgroundColor: 'white',
                        borderRadius: 2 
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
                <Button
                  variant="contained"
                  onClick={handleDateRangeSubmit}
                  disabled={isLoading}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                  startIcon={<CalendarToday />}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Period'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={resetDateRange}
                  sx={{ 
                    px: 3, 
                    py: 1.5, 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'grey.300', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ mt: 2, color: 'white', opacity: 0.8 }}>
            Period: {dateRange.startDate?.format('MMM DD, YYYY')} to {dateRange.endDate?.format('MMM DD, YYYY')} 
            ({dateRange.endDate?.diff(dateRange.startDate, 'day') + 1} days)
          </Typography>
        </Paper>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Statistics Cards */}
        {!isLoading && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Total Income"
                  value={filteredData.statistics.totalIncome}
                  icon={<TrendingUp sx={{ fontSize: 28 }} />}
                  color="success"
                  subtitle={`Highest: ${formatCurrency(filteredData.statistics.highestIncome)}`}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Total Expenses"
                  value={filteredData.statistics.totalExpenses}
                  icon={<TrendingDown sx={{ fontSize: 28 }} />}
                  color="error"
                  subtitle={`Highest: ${formatCurrency(filteredData.statistics.highestExpense)}`}
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Net Savings"
                  value={filteredData.statistics.totalSavings}
                  icon={<Savings sx={{ fontSize: 28 }} />}
                  color={filteredData.statistics.totalSavings >= 0 ? "primary" : "warning"}
                  subtitle={filteredData.statistics.totalSavings >= 0 ? "Surplus" : "Deficit"}
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Avg Daily Spending"
                  value={filteredData.statistics.avgDailySpending}
                  icon={<AccountBalanceWallet sx={{ fontSize: 28 }} />}
                  color="info"
                  subtitle={`${filteredData.statistics.transactionCount} transactions`}
                />
              </Grid>
            </Grid>

            {/* Additional Statistics */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Detailed Analytics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Average Expenditure per Transaction
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(filteredData.statistics.averageExpenditure)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Savings Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {filteredData.statistics.totalIncome > 0 
                        ? `${((filteredData.statistics.totalSavings / filteredData.statistics.totalIncome) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Charts Section */}
            <Grid container spacing={3}>
              {/* Daily Trend Line Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Daily Income & Expense Trend
                  </Typography>
                  
                  {filteredData.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={filteredData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${Math.abs(value).toLocaleString('en-IN')}`}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#4CAF50"
                          strokeWidth={3}
                          dot={{ fill: '#4CAF50', r: 4 }}
                          name="Income"
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#f44336"
                          strokeWidth={3}
                          dot={{ fill: '#f44336', r: 4 }}
                          name="Expenses"
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="net"
                          stroke="#2196F3"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: '#2196F3', r: 3 }}
                          name="Net Flow"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No transaction data available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try selecting a different date range or add some transactions
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Category Breakdown and Summary */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3, height: 450 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Expense Categories
                  </Typography>
                  
                  {filteredData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie
                          data={filteredData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
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
                        No expense categories to display
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Summary Bar Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3, height: 450 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Period Summary
                  </Typography>
                  
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={[{
                      name: 'Financial Summary',
                      income: filteredData.statistics.totalIncome,
                      expenses: filteredData.statistics.totalExpenses,
                      savings: filteredData.statistics.totalSavings,
                    }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `₹${Math.abs(value).toLocaleString('en-IN')}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" fill="#4CAF50" name="Income" />
                      <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                      <Bar dataKey="savings" fill="#2196F3" name="Net Savings" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;
