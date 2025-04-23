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
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    collection = db.collection('PublicCompanies');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}
connectDB();

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/process', async (req, res) => {
  const query = req.query.query || '';
  const searchType = req.query.searchType || '';
  let results = [];

  try {
    if (searchType === 'ticker') {
      results = await collection.find({
        ticker: { $regex: new RegExp(query, 'i') }
      }).toArray();
    } else if (searchType === 'company') {
      results = await collection.find({
        name: { $regex: new RegExp(query, 'i') }
      }).toArray();
    }

    res.render('process', { results, query, searchType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data from database');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
