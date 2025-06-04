const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tickets: true
      }
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tickets: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      maxCapacity,
      organizerId,
      tickets
    } = req.body;

    // Create event with nested tickets
    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        maxCapacity,
        organizerId: Number(organizerId),
        tickets: {
          create: tickets.map(ticket => ({
            type: ticket.type,
            price: ticket.price,
            quantity: ticket.quantity,
            remainingCount: ticket.quantity,
            benefits: ticket.benefits
          }))
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tickets: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      maxCapacity,
      isActive
    } = req.body;

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        maxCapacity,
        isActive
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tickets: true
      }
    });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    // First, delete all related records
    await prisma.$transaction([
      // Delete all registrations related to the event's tickets
      prisma.registration.deleteMany({
        where: {
          eventId: eventId
        }
      }),
      // Delete all tickets for the event
      prisma.ticket.deleteMany({
        where: {
          eventId: eventId
        }
      }),
      // Delete the event itself
      prisma.event.delete({
        where: {
          id: eventId
        }
      })
    ]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchEvents = async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      location,
      minPrice,
      maxPrice
    } = req.query;

    let whereClause = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (startDate) {
      whereClause.startDate = {
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.endDate = {
        lte: new Date(endDate)
      };
    }

    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        tickets: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Filter by price range if specified
    let filteredEvents = events;
    if (minPrice || maxPrice) {
      filteredEvents = events.filter(event => {
        const eventMinPrice = Math.min(...event.tickets.map(t => t.price));
        const eventMaxPrice = Math.max(...event.tickets.map(t => t.price));
        
        if (minPrice && maxPrice) {
          return eventMinPrice >= Number(minPrice) && eventMaxPrice <= Number(maxPrice);
        } else if (minPrice) {
          return eventMinPrice >= Number(minPrice);
        } else if (maxPrice) {
          return eventMaxPrice <= Number(maxPrice);
        }
        return true;
      });
    }

    res.status(200).json(filteredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents
};
