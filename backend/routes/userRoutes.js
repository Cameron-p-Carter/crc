const express = require('express');
const {
  getAllUsers,
  getUserById,
  register,
  login,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/register', register);   // POST /users/register
router.post('/login', login);         // POST /users/login

// Protected routes (in a real app, these would be behind authentication middleware)
router.get('/', getAllUsers);         // GET /users
router.get('/:id', getUserById);      // GET /users/:id
router.put('/:id', updateUser);       // PUT /users/:id
router.delete('/:id', deleteUser);    // DELETE /users/:id

module.exports = router;
