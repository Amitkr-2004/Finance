const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const transactionController = require('../controller/transactionController');

// Apply authentication middleware
router.use(auth);

// POST /api/transactions  -> create a transaction (uses controller)
router.post('/', transactionController.createTransaction);

// GET /api/transactions  -> list with optional pagination/filters (uses controller)
router.get('/', transactionController.listTransactions);

// GET /api/transactions/all -> keep existing simple listing behavior for compatibility
router.get('/all', async (req, res) => {
  try {
    console.log('📋 Fetching transactions for user:', req.user._id || req.user.id);
    const transactions = await Transaction.find({
      user: req.user._id || req.user.id
    }).sort({ date: -1 });

    console.log(`✅ Found ${transactions.length} transactions`);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('✏️ Updating transaction:', id, updateData);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id || req.user.id },
      updateData,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting transaction:', id);

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id || req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
});

module.exports = router;
