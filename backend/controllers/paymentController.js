const { PrismaClient } = require('@prisma/client');
const { processPayment, processRefund } = require('./walletController');
const { createSystemNotification } = require('./notificationController');
const prisma = new PrismaClient();

const createPayment = async (req, res) => {
  try {
    const { registrationId } = req.body;

    // Get registration details with user and ticket info
    const registration = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: {
        user: true,
        ticket: true,
        event: true,
        payment: true
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if payment already exists
    if (registration.payment) {
      return res.status(400).json({ message: 'Payment already exists for this registration' });
    }

    const amount = registration.ticket.price;

    // Process payment using wallet
    await prisma.$transaction(async (prisma) => {
      // Process the payment using wallet
      await processPayment(
        prisma,
        registration.userId,
        amount,
        `Payment for ${registration.event.title} - ${registration.ticket.type} ticket`
      );

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          registrationId: Number(registrationId),
          amount,
          status: 'COMPLETED',
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

    // Create notifications
    await createSystemNotification(
      registration.userId,
      'Payment Successful',
      `Your payment of $${amount} for ${registration.event.title} has been processed. Your registration is now confirmed.`
    );

    await createSystemNotification(
      registration.event.organizerId,
      'Payment Received',
      `Payment received for ${registration.event.title} from ${registration.user.name}.`
    );

    // Get updated registration with payment info
    const updatedRegistration = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true
          }
        },
        event: true,
        ticket: true,
        payment: true
      }
    });

    res.status(201).json(updatedRegistration);
  } catch (error) {
    if (error.message === 'Insufficient funds') {
      return res.status(400).json({ message: 'Insufficient funds in wallet' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getPaymentByRegistration = async (req, res) => {
  try {
    const registrationId = Number(req.params.registrationId);
    const payment = await prisma.payment.findUnique({
      where: { registrationId },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                walletBalance: true
              }
            },
            event: true,
            ticket: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processRefundPayment = async (req, res) => {
  try {
    const registrationId = Number(req.params.registrationId);

    // Get registration details with payment info
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        event: true,
        ticket: true,
        payment: true
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (!registration.payment) {
      return res.status(400).json({ message: 'No payment found for this registration' });
    }

    if (registration.payment.status === 'REFUNDED') {
      return res.status(400).json({ message: 'Payment has already been refunded' });
    }

    // Process refund using wallet
    await prisma.$transaction(async (prisma) => {
      // Process the refund
      await processRefund(
        prisma,
        registration.userId,
        registration.payment.amount,
        `Refund for ${registration.event.title} - ${registration.ticket.type} ticket`
      );

      // Update payment status
      await prisma.payment.update({
        where: { id: registration.payment.id },
        data: { status: 'REFUNDED' }
      });

      // Update registration status
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' }
      });

      // Update ticket availability
      await prisma.ticket.update({
        where: { id: registration.ticketId },
        data: {
          remainingCount: {
            increment: 1
          }
        }
      });

      // Update event capacity
      await prisma.event.update({
        where: { id: registration.eventId },
        data: {
          currentCapacity: {
            decrement: 1
          }
        }
      });
    });

    // Create notifications
    await createSystemNotification(
      registration.userId,
      'Refund Processed',
      `Your refund of $${registration.payment.amount} for ${registration.event.title} has been processed.`
    );

    await createSystemNotification(
      registration.event.organizerId,
      'Refund Issued',
      `Refund issued for ${registration.event.title} to ${registration.user.name}.`
    );

    // Get updated registration with payment info
    const updatedRegistration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true
          }
        },
        event: true,
        ticket: true,
        payment: true
      }
    });

    res.status(200).json(updatedRegistration);
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
  processRefundPayment,
  getPaymentsByEvent
};
