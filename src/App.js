const express = require('express');
const connectDatabase = require('./server.mjs');

const app = express();
const port = 3000; // Choose your desired port

app.get('/api/rhsa', async (req, res) => {
  const db = await connectDatabase();
  const collection = db.collection('RHSA'); // Correct collection name

  try {
    const data = await collection.find().toArray();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    db.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
