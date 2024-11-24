const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

//json
app.use(express.json());

//cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//test api
app.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is working' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all persons
app.get('/persons', async (req, res) => {
  try {
    const persons = await prisma.person.findMany();
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get person by id
app.get('/persons/:id', async (req, res) => {
  try {
    const person = await prisma.person.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//create person
app.post('/persons', async (req, res) => {
  try {
    const person = await prisma.person.create({
      data: {
        name: req.body.name,
        email: req.body.email
      },
    });
    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update person
app.put('/persons/:id', async (req, res) => {
  try {
    const person = await prisma.person.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        email: req.body.email
      },
    });
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete person
app.delete('/persons/:id', async (req, res) => {
  try {
    const person = await prisma.person.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));