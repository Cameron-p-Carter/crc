const express = require('express');
const { getAllUsers, getUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers); // GET /users
router.get('/:id', getUserById); // GET /users/:id

module.exports = router;
