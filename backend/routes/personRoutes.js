const express = require('express');
const { getAllPersons, getPersonById } = require('../controllers/personController');

const router = express.Router();

router.get('/', getAllPersons); // GET /persons
router.get('/:id', getPersonById); // GET /persons/:id

module.exports = router;
