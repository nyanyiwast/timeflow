const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  // Mongoose or DB error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error' });
  }

  // Default error
  res.status(500).json({ error: 'Something went wrong!' });
};

module.exports = errorHandler;