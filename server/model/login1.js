const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensures uniqueness of email
  },
  password: {
    type: String,
    required: true
  }
});

// Create and export the User model
const Register = mongoose.model('Register', userSchema);

module.exports = Register;
