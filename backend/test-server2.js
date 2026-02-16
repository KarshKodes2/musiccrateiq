const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

console.log('Starting server...');

const server = app.listen(5000, () => {
  console.log('✅ Server is listening on port 5000');
  console.log('Server object:', typeof server);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep alive
setInterval(() => {
  console.log('Still alive...');
}, 5000);

console.log('Script continues after app.listen()...');
