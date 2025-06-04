const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  try {
    const { type, title, parameters, eventId, organizerId } = req.body;

    const report = await prisma.report.create({
      data: {
        type,
        title,
        parameters,
        eventId: Number(eventId),
        organizerId: Number(organizerId)
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventReports = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const reports = await prisma.report.findMany({
      where: {
        eventId: eventId
      },
      include: {
        event: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrganizerReports = async (req, res) => {
  try {
    const organizerId = Number(req.params.organizerId);

    const reports = await prisma.report.findMany({
      where: {
        organizerId: organizerId
      },
      include: {
        event: true
      }
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateAttendanceReport = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    // Get event details with registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
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

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate attendance statistics
    const totalRegistrations = event.registrations.length;
    const approvedRegistrations = event.registrations.filter(r => r.status === 'APPROVED').length;
    const pendingRegistrations = event.registrations.filter(r => r.status === 'PENDING').length;
    const cancelledRegistrations = event.registrations.filter(r => r.status === 'CANCELLED').length;

    const ticketTypeBreakdown = event.registrations.reduce((acc, reg) => {
      const type = reg.ticket.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Create report
    const report = await prisma.report.create({
      data: {
        type: 'ATTENDANCE',
        title: `Attendance Report - ${event.title}`,
        parameters: {
          totalRegistrations,
          approvedRegistrations,
          pendingRegistrations,
          cancelledRegistrations,
          ticketTypeBreakdown,
          currentCapacity: event.currentCapacity,
          maxCapacity: event.maxCapacity,
          registrationList: event.registrations.map(reg => ({
            userId: reg.user.id,
            userName: reg.user.name,
            userEmail: reg.user.email,
            ticketType: reg.ticket.type,
            status: reg.status
          }))
        },
        eventId: event.id,
        organizerId: event.organizerId
      }
    });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateSalesReport = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    // Get event details with registrations and payments
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        registrations: {
          include: {
            ticket: true,
            payment: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate sales statistics
    const completedPayments = event.registrations
      .filter(reg => reg.payment && reg.payment.status === 'COMPLETED');
    
    const totalRevenue = completedPayments
      .reduce((sum, reg) => sum + reg.payment.amount, 0);

    const revenueByTicketType = completedPayments.reduce((acc, reg) => {
      const type = reg.ticket.type;
      acc[type] = (acc[type] || 0) + reg.payment.amount;
      return acc;
    }, {});

    const ticketsSold = event.tickets.map(ticket => ({
      type: ticket.type,
      price: ticket.price,
      sold: ticket.quantity - ticket.remainingCount,
      remaining: ticket.remainingCount,
      revenue: revenueByTicketType[ticket.type] || 0
    }));

    // Create report
    const report = await prisma.report.create({
      data: {
        type: 'SALES',
        title: `Sales Report - ${event.title}`,
        parameters: {
          totalRevenue,
          ticketsSold,
          paymentBreakdown: {
            completed: completedPayments.length,
            pending: event.registrations.filter(reg => !reg.payment || reg.payment.status === 'PENDING').length,
            refunded: event.registrations.filter(reg => reg.payment && reg.payment.status === 'REFUNDED').length
          }
        },
        eventId: event.id,
        organizerId: event.organizerId
      }
    });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getEventReports,
  getOrganizerReports,
  generateAttendanceReport,
  generateSalesReport
};
