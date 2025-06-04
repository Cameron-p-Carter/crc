const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWalletBalance = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const depositToWallet = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Deposit amount must be positive' });
    }

    // Use transaction to ensure both operations complete
    const result = await prisma.$transaction(async (prisma) => {
      // Update user's wallet balance
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: amount
          }
        }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: userId,
          type: 'DEPOSIT',
          amount: amount,
          description: `Wallet deposit of $${amount}`
        }
      });

      return { user: updatedUser, transaction };
    });

    res.status(200).json({
      balance: result.user.walletBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to be used by other controllers
const processPayment = async (prisma, userId, amount, description) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.walletBalance < amount) {
    throw new Error('Insufficient funds');
  }

  // Update wallet balance and create transaction
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      walletBalance: {
        decrement: amount
      }
    }
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'WITHDRAWAL',
      amount,
      description
    }
  });

  return { user: updatedUser, transaction };
};

// Helper function to process refunds
const processRefund = async (prisma, userId, amount, description) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      walletBalance: {
        increment: amount
      }
    }
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'REFUND',
      amount,
      description
    }
  });

  return { user: updatedUser, transaction };
};

module.exports = {
  getWalletBalance,
  depositToWallet,
  getTransactionHistory,
  processPayment,
  processRefund
};
