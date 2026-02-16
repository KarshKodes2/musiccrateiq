const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(5000, () => {
  console.log('Test server running on port 5000');
});

console.log('After app.listen(), server:', server ? 'exists' : 'null');
