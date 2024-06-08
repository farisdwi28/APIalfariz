const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey);
};

exports.validateUser = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    console.log({ err });
    return false;
  }
};
