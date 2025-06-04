const express = require('express');
const {
  getWalletBalance,
  depositToWallet,
  getTransactionHistory
} = require('../controllers/walletController');

const router = express.Router();

// Get wallet balance
router.get('/:userId/balance', getWalletBalance);       // GET /wallet/123/balance

// Deposit to wallet
router.post('/:userId/deposit', depositToWallet);       // POST /wallet/123/deposit

// Get transaction history
router.get('/:userId/transactions', getTransactionHistory); // GET /wallet/123/transactions

module.exports = router;
