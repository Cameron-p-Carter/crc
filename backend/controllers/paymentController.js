const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPayment = async (req, res) => {
  try {
    const { registrationId, amount } = req.body;

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: {
        payment: true,
        ticket: true
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if payment already exists
    if (registration.payment) {
      return res.status(400).json({ message: 'Payment already exists for this registration' });
    }

    // Verify amount matches ticket price
    if (amount !== registration.ticket.price) {
      return res.status(400).json({ message: 'Payment amount does not match ticket price' });
    }

    // Create payment and update registration status in a transaction
    const payment = await prisma.$transaction(async (prisma) => {
      // Create payment
      const payment = await prisma.payment.create({
        data: {
          registrationId: Number(registrationId),
          amount,
          status: 'COMPLETED', // For university project, assume payment is always successful
          paymentDate: new Date()
        }
      });

      // Update registration status
      await prisma.registration.update({
        where: { id: Number(registrationId) },
        data: { status: 'APPROVED' }
      });

      return payment;
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentByRegistration = async (req, res) => {
  try {
    const registrationId = Number(req.params.registrationId);
    const payment = await prisma.payment.findUnique({
      where: { registrationId }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processRefund = async (req, res) => {
  try {
    const registrationId = Number(req.params.registrationId);

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { registrationId }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ message: 'Payment has already been refunded' });
    }

    // Process refund and update registration status
    const updatedPayment = await prisma.$transaction(async (prisma) => {
      // Update payment status
      const payment = await prisma.payment.update({
        where: { registrationId },
        data: { status: 'REFUNDED' }
      });

      // Update registration status
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' }
      });

      return payment;
    });

    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentsByEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const payments = await prisma.payment.findMany({
      where: {
        registration: {
          eventId: eventId
        }
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            ticket: true
          }
        }
      }
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPaymentByRegistration,
  processRefund,
  getPaymentsByEvent
};
