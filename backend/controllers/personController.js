const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllPersons = async (req, res) => {
  try {
    const persons = await prisma.person.findMany();
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPersonById = async (req, res) => {
  try {
    const person = await prisma.person.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPersons,
  getPersonById,
};
