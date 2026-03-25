// Handler pentru erori de CastError (ID invalid în MongoDB)
const handleCastError = (res, err) => {
  if (err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'ID invalid.' });
  }
};

// Middleware global de erori — trebuie să fie ultimul app.use()
const errorHandler = (err, req, res, next) => {
  console.error('❌ Eroare neașteptată:', err.message);

  if (err.name === 'CastError') {
    return handleCastError(res, err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Eroare internă de server.' });
};

module.exports = errorHandler;