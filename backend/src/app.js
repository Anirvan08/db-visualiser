const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Placeholder route for metadata parsing
app.post('/parse-metadata', (req, res) => {
  res.json({ message: 'Metadata parsing endpoint (to be implemented)' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
