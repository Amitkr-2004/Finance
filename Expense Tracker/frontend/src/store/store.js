import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/auth/authSlice';
import transactionSlice from '../features/transactions/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    transactions: transactionSlice,
  },
});
