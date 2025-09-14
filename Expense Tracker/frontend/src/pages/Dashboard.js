import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditCard,
  Add as AddIcon,
  Timeline as TrendIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import {
  fetchTransactions,
  setChartFilter,
  addOptimisticTransaction,
  removeOptimisticTransaction,
  createTransaction,
} from '../features/transactions/transactionSlice';
import TransactionForm from '../components/TransactionForm';
import {
  InteractivePieChart,
  InteractiveLineChart,
} from '../components/Charts/InteractiveCharts';
import {
  FadeIn,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedNumber,
} from '../components/Animations/AnimatedComponents';
import { useOptimisticUpdates } from '../hooks/useOptimisticUpdates';

const MetricPanel = ({
  title,
  value,
  icon,
  color,
  trend,
  trendValue,
  index,
  isOptimistic = false,
}) => {
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
    <StaggerItem index={index}>
      <AnimatedCard>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 4,
            background: getGradientColors(color),
            position: 'relative',
            overflow: 'hidden',
            border: isOptimistic ? '2px solid rgba(255,255,255,0.3)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isOptimistic
                ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%)'
                : 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {title} {isOptimistic && '• SYNCING'}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '2.2rem',
                    letterSpacing: '-0.02em',
                    mt: 1,
                  }}
                >
                  ₹<AnimatedNumber value={value} />
                </Typography>
              </Box>
              <motion.div
                animate={isOptimistic ? { rotate: [0, 360] } : {}}
                transition={{ duration: 2, repeat: isOptimistic ? Infinity : 0 }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    width: 56,
                    height: 56,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {icon}
                </Avatar>
              </motion.div>
            </Box>

            {trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    {trend === 'up' ? (
                      <TrendingUp sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, mr: 1 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, mr: 1 }} />
                    )}
                  </motion.div>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {trendValue}% vs last cycle
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.abs(trendValue)}
                  sx={{
                    width: 60,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </AnimatedCard>
    </StaggerItem>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { data: transactions = [], optimisticData = {}, chartFilters = {} } = useSelector(
    (state) => state.transactions
  );

  const [openForm, setOpenForm] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { addOptimisticTransaction: addOptimistic, confirmOptimisticTransaction, revertOptimisticTransaction } =
    useOptimisticUpdates();

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const allTransactions = [...transactions, ...Object.values(optimisticData)];

  const stats = allTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
        if (!acc.expensesByCategory[transaction.category]) {
          acc.expensesByCategory[transaction.category] = 0;
        }
        acc.expensesByCategory[transaction.category] += transaction.amount;
      }
      return acc;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      expensesByCategory: {},
    }
  );

  const totalBalance = stats.totalIncome - stats.totalExpenses;
  const savings = totalBalance > 0 ? totalBalance : 0;
  const hasOptimisticData = Object.keys(optimisticData).length > 0;

  const expenseData = Object.entries(stats.expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const dailyData = {};
  allTransactions.forEach((transaction) => {
    const date = dayjs(transaction.date).format('MMM DD');
    if (!dailyData[date]) {
      dailyData[date] = { date, income: 0, expenses: 0 };
    }
    if (transaction.type === 'income') {
      dailyData[date].income += transaction.amount;
    } else {
      dailyData[date].expenses += transaction.amount;
    }
    dailyData[date].net = dailyData[date].income - dailyData[date].expenses;
  });

  const trendData = Object.values(dailyData).sort(
    (a, b) => dayjs(a.date, 'MMM DD').valueOf() - dayjs(b.date, 'MMM DD').valueOf()
  );

  const handlePieChartClick = (categoryName) => {
    dispatch(setChartFilter({ activeCategory: categoryName }));
    setNotification({
      open: true,
      message: categoryName ? `Analysis filtered by: ${categoryName}` : 'Filter cleared - showing all data',
      severity: 'info',
    });
  };

  const handleLineChartClick = (data, lineKey) => {
    setNotification({
      open: true,
      message: `${data.date}: ${lineKey} = ₹${data[lineKey]?.toLocaleString('en-IN')}`,
      severity: 'info',
    });
  };

  const handleOptimisticCreate = async (transactionData) => {
    const tempId = `temp_${Date.now()}`;

    try {
      const optimisticTransaction = addOptimistic(tempId, transactionData);
      dispatch(addOptimisticTransaction({ tempId, transaction: optimisticTransaction }));

      setNotification({
        open: true,
        message: 'Data entry initiated - processing...',
        severity: 'info',
      });

      const result = await dispatch(createTransaction(transactionData)).unwrap();
      confirmOptimisticTransaction(tempId, result);
      dispatch(removeOptimisticTransaction(tempId));

      setNotification({
        open: true,
        message: 'Data successfully integrated into system',
        severity: 'success',
      });
    } catch (error) {
      revertOptimisticTransaction(tempId);
      dispatch(removeOptimisticTransaction(tempId));

      setNotification({
        open: true,
        message: 'System error - data integration failed',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        transition: 'background-color 0.4s ease',
        ...(theme.palette.mode === 'light' && {
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(233, 69, 96, 0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 212, 170, 0.07) 0%, transparent 50%)',
        }),
      }}
    >
      <FadeIn>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 5,
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: '2.8rem',
                letterSpacing: '-0.03em',
                mb: 1,
              }}
            >
              System Dashboard
              {hasOptimisticData && (
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                  <Chip
                    label="SYNC ACTIVE"
                    size="small"
                    sx={{
                      ml: 3,
                      background: 'linear-gradient(135deg, #00d4aa, #33e4c4)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                    }}
                  />
                </motion.span>
              )}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
                fontSize: '1.1rem',
                letterSpacing: '0.02em',
              }}
            >
              Real-time Financial Analytics Interface
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #e94560, #ff6b88)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(233, 69, 96, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff6b88, #e94560)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(233, 69, 96, 0.45)',
                },
              }}
            >
              New Entry
            </Button>
          </motion.div>
        </Box>
      </FadeIn>

      <StaggerContainer staggerDelay={0.12}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricPanel
              title="Net Position"
              value={totalBalance}
              icon={<AccountBalance />}
              color="primary"
              trend={totalBalance >= 0 ? 'up' : 'down'}
              trendValue={12}
              index={0}
              isOptimistic={hasOptimisticData}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricPanel
              title="Inflow Stream"
              value={stats.totalIncome}
              icon={<TrendingUp />}
              color="success"
              trend="up"
              trendValue={8}
              index={1}
              isOptimistic={hasOptimisticData}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricPanel
              title="Outflow Volume"
              value={stats.totalExpenses}
              icon={<TrendingDown />}
              color="error"
              trend="down"
              trendValue={5}
              index={2}
              isOptimistic={hasOptimisticData}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricPanel
              title="Reserve Buffer"
              value={savings}
              icon={<CreditCard />}
              color="warning"
              trend={savings > 0 ? 'up' : 'down'}
              trendValue={15}
              index={3}
              isOptimistic={hasOptimisticData}
            />
          </Grid>
        </Grid>
      </StaggerContainer>

      <SlideIn direction="up" delay={0.4}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} lg={6} sx={{minWidth: "30rem"}}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 4,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(233, 69, 96, 0.15)',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease',
              }}
            >
              <InteractivePieChart
                data={expenseData}
                onSegmentClick={handlePieChartClick}
                activeSegment={chartFilters.activeCategory}
                title="Distribution Analysis"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6} sx={{minWidth: "30rem"}}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 4,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(233, 69, 96, 0.15)',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease',
              }}
            >
              <InteractiveLineChart
                data={trendData}
                onPointClick={handleLineChartClick}
                title="Temporal Flow Patterns"
              />
            </Paper>
          </Grid>
        </Grid>
      </SlideIn>

      <SlideIn direction="up" delay={0.6}>
        <AnimatedCard>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(16, 16, 24, 0.85)' : '#fff',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(233, 69, 96, 0.15)',
              transition: 'background-color 0.3s ease',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: '1.5rem',
                  letterSpacing: '0.02em',
                }}
              >
                Recent System Activity
                {hasOptimisticData && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      ml: 3,
                      color: '#00d4aa',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    • Live Updates Active
                  </Typography>
                )}
              </Typography>
              <Chip
                icon={<TrendIcon />}
                label="REAL-TIME"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              />
            </Box>

            <AnimatePresence mode="popLayout">
              {allTransactions.slice(0, 8).map((transaction, index) => (
                <motion.div
                  key={transaction._id || transaction.tempId}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  layout
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 3,
                      px: 4,
                      borderBottom: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: 3,
                      mb: 2,
                      background: transaction.isOptimistic
                        ? 'rgba(0, 212, 170, 0.08)'
                        : theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)',
                      border: transaction.isOptimistic
                        ? '1px solid rgba(0, 212, 170, 0.2)'
                        : theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      opacity: transaction.isOptimistic ? 0.9 : 1,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        background: transaction.isOptimistic
                          ? 'rgba(0, 212, 170, 0.12)'
                          : theme.palette.mode === 'dark'
                          ? 'rgba(233, 69, 96, 0.08)'
                          : 'rgba(233, 69, 96, 0.04)',
                        border: transaction.isOptimistic
                          ? '1px solid rgba(0, 212, 170, 0.3)'
                          : theme.palette.mode === 'dark'
                          ? '1px solid rgba(233, 69, 96, 0.2)'
                          : '1px solid rgba(233, 69, 96, 0.1)',
                        transform: 'translateX(8px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background:
                            transaction.type === 'income'
                              ? 'linear-gradient(135deg, #00d4aa, #33e4c4)'
                              : 'linear-gradient(135deg, #ff4757, #ff6b88)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: '1rem',
                            mb: 0.5,
                          }}
                        >
                          {transaction.description || transaction.category}
                          {transaction.isOptimistic && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                ml: 2,
                                color: '#00d4aa',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                              }}
                            >
                              Processing...
                            </Typography>
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          {dayjs(transaction.date).format('MMM DD, YYYY • HH:mm')}
                        </Typography>
                      </Box>
                    </Box>

                    <motion.div
                      animate={transaction.isOptimistic ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1.5, repeat: transaction.isOptimistic ? Infinity : 0 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: transaction.type === 'income' ? '#00d4aa' : '#ff4757',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                      </Typography>
                    </motion.div>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Paper>
        </AnimatedCard>
      </SlideIn>

      <TransactionForm open={openForm} onClose={() => setOpenForm(false)} onOptimisticSubmit={handleOptimisticCreate} />

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ borderRadius: 3, fontSize: '0.9rem', fontWeight: 600 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
