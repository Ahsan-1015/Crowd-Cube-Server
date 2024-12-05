require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 8000;
const app = express();

//aaaaahshanhabib
//b2zPqQIaxDArXuON

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI from environment variables
const uri =
  'mongodb+srv://aaaaahshanhabib:b2zPqQIaxDArXuON@cluster0.ing8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db('campaignDb');
    const campaignCollection = database.collection('campaigns');

    // Get all campaigns
    app.get('/campaigns', async (req, res) => {
      try {
        const cursor = campaignCollection.find();
        const campaigns = await cursor.toArray();
        res.status(200).json(campaigns);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
      }
    });

    // Backend sorting for campaigns
    app.get('/campaigns', async (req, res) => {
      const sortOrder = req.query.sort === 'desc' ? -1 : 1; // Default to ascending
      try {
        const cursor = campaignCollection
          .find()
          .sort({ minDonation: sortOrder });
        const campaigns = await cursor.toArray();
        res.status(200).json(campaigns);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
      }
    });

    // Get a single campaign by ID
    app.get('/campaigns/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const campaign = await campaignCollection.findOne({
          _id: new ObjectId(id),
        });
        if (campaign) {
          res.status(200).json(campaign);
        } else {
          res.status(404).json({ message: 'Campaign not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaign' });
      }
    });

    // Add a new campaign
    app.post('/campaigns', async (req, res) => {
      const newCampaign = req.body;

      if (
        !newCampaign.title ||
        !newCampaign.minDonation ||
        !newCampaign.deadline
      ) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const result = await campaignCollection.insertOne(newCampaign);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to add campaign' });
      }
    });

    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Crowd cube server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
