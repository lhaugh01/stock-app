async function connectDB() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    collection = db.collection('PublicCompanies');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process if MongoDB connection fails
  }
}

require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);
let collection;

async function connectDB() {
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  collection = db.collection('PublicCompanies');
}
connectDB();

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/process', async (req, res) => {
  const { searchType, query } = req.query;
  const search = query.trim();
  let results = [];

  if (searchType === 'ticker') {
    results = await collection.find({ ticker: new RegExp(`^${search}$`, 'i') }).toArray();
  } else if (searchType === 'company') {
    results = await collection.find({ name: new RegExp(search, 'i') }).toArray();
  }

  console.log(results); // Also log in console for assignment
  res.render('result', { results, search });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
