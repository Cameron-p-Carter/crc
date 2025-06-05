const { PrismaClient } = require('@prisma/client');
const { processRefund } = require('./walletController');
const { createSystemNotification } = require('./notificationController');
const prisma = new PrismaClient();

const createRegistration = async (req, res) => {
  try {
    const { userId, eventId, ticketId } = req.body;

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: {
        tickets: {
          where: { id: Number(ticketId) }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is not active' });
    }

    // Check if ticket exists and has available spots
    const ticket = event.tickets[0];
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.remainingCount <= 0) {
      return res.status(400).json({ message: 'Ticket is sold out' });
    }

    // Check if user already registered for this event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        userId: Number(userId),
        eventId: Number(eventId)
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    // Create registration and update ticket count in a transaction
    const registration = await prisma.$transaction(async (prisma) => {
      // Create registration
      const registration = await prisma.registration.create({
        data: {
          userId: Number(userId),
          eventId: Number(eventId),
          ticketId: Number(ticketId),
          status: 'PENDING'
        },
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
      });

      // Update ticket remaining count
      await prisma.ticket.update({
        where: { id: Number(ticketId) },
        data: {
          remainingCount: ticket.remainingCount - 1
        }
      });

      // Update event current capacity
      await prisma.event.update({
        where: { id: Number(eventId) },
        data: {
          currentCapacity: event.currentCapacity + 1
        }
      });

      return registration;
    });

    // Create notification for user
    await createSystemNotification(
      userId,
      'Registration Pending',
      `Your registration for ${event.title} is pending. Please complete the payment to confirm your spot.`
    );

    // Create notification for event organizer
    await createSystemNotification(
      event.organizerId,
      'New Registration',
      `New registration received for ${event.title} from ${registration.user.name}.`
    );

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationById = async (req, res) => {
  try {
    const registrationId = Number(req.params.id);
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        event: true,
        ticket: true,
        payment: true
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const registrations = await prisma.registration.findMany({
      where: {
        eventId: eventId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true
          }
        },
        ticket: true,
        payment: true
      }
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const registrations = await prisma.registration.findMany({
      where: {
        userId: userId
      },
      include: {
        event: true,
        ticket: true,
        payment: true
      }
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const registrationId = Number(req.params.id);
    const { status } = req.body;

    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
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

    // Create notification for status change
    await createSystemNotification(
      registration.userId,
      'Registration Status Updated',
      `Your registration for ${registration.event.title} has been ${status.toLowerCase()}.`
    );

    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const registrationId = Number(req.params.id);

    // Get registration details
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

    // Update registration and related records in a transaction
    await prisma.$transaction(async (prisma) => {
      // Update registration status
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' }
      });

      // Increase ticket remaining count
      await prisma.ticket.update({
        where: { id: registration.ticketId },
        data: {
          remainingCount: registration.ticket.remainingCount + 1
        }
      });

      // Decrease event current capacity
      await prisma.event.update({
        where: { id: registration.eventId },
        data: {
          currentCapacity: registration.event.currentCapacity - 1
        }
      });

      // If there's a payment, process refund
      if (registration.payment && registration.payment.status === 'COMPLETED') {
        // Process refund using wallet
        await processRefund(
          prisma,
          registration.userId,
          registration.payment.amount,
          `Refund for cancelled registration - ${registration.event.title}`
        );

        // Update payment status
        await prisma.payment.update({
          where: { id: registration.payment.id },
          data: { status: 'REFUNDED' }
        });
      }
    });

    // Create notifications
    await createSystemNotification(
      registration.userId,
      'Registration Cancelled',
      `Your registration for ${registration.event.title} has been cancelled.`
    );

    await createSystemNotification(
      registration.event.organizerId,
      'Registration Cancelled',
      `A registration for ${registration.event.title} has been cancelled by ${registration.user.name}.`
    );

    // Get updated registration
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

module.exports = {
  createRegistration,
  getRegistrationById,
  getRegistrationsByEvent,
  getRegistrationsByUser,
  updateRegistrationStatus,
  cancelRegistration
};
