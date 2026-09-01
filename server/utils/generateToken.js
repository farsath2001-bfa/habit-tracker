const jwt = require('jsonwebtoken');

/** Signs a JWT carrying the user's id, valid for 30 days. */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = generateToken;
