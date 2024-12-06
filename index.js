// require('dotenv').config(); // Load environment variables from .env file
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
    const donatedCollection = database.collection('donated'); // New collection for donations

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

    app.get('/myCampaigns', async (req, res) => {
      const { userEmail } = req.query; // Extract the email from query parameters
      if (!userEmail) {
        return res
          .status(400)
          .json({ message: 'Email query parameter is required.' });
      }

      try {
        // Filter campaigns by userEmail
        const campaigns = await campaignCollection
          .find({ userEmail })
          .toArray();
        res.status(200).json(campaigns); // Send the campaigns back to the frontend
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns.' });
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
    // app.post('/campaigns', async (req, res) => {
    //   const newCampaign = req.body;

    //   if (
    //     !newCampaign.title ||
    //     !newCampaign.minDonation ||
    //     !newCampaign.deadline
    //   ) {
    //     return res.status(400).json({ error: 'Missing required fields' });
    //   }

    //   try {
    //     const result = await campaignCollection.insertOne(newCampaign);
    //     res.status(201).json(result);
    //   } catch (error) {
    //     res.status(500).json({ error: 'Failed to add campaign' });
    //   }
    // });

    // POST - Add Visa (with userEmail)
    app.post('/campaigns', async (req, res) => {
      const data = req.body;
      if (!data.userEmail) {
        return res.status(400).json({ message: 'User email is required.' });
      }

      try {
        const result = await campaignCollection.insertOne(data);
        res.status(201).json(result);
      } catch (error) {
        console.error('Error adding visa:', error);
        res.status(500).json({ message: 'Error adding visa.' });
      }
    });

    // New POST endpoint for donations
    app.post('/donate', async (req, res) => {
      const { campaignId, userEmail, username, minDonation } = req.body;

      // Validate required fields
      if (!campaignId || !userEmail || !username || !minDonation) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Construct donation data
      const newDonation = {
        campaignId: new ObjectId(campaignId), // Assuming campaignId is provided as a string
        userEmail,
        username,
        minDonation,
        donatedAt: new Date(),
      };

      try {
        // Insert the donation into the 'donated' collection
        const result = await donatedCollection.insertOne(newDonation);

        // Send success response
        res.status(201).json({
          message: 'Donation successfully recorded!',
          donationId: result.insertedId,
        });
      } catch (error) {
        console.error('Error inserting donation:', error);
        res.status(500).json({ error: 'Failed to record donation' });
      }
    });

    app.get('/campaigns', async (req, res) => {
      const { email } = req.query;
      if (!email) {
        return res
          .status(400)
          .json({ message: 'Email query parameter is required.' });
      }

      try {
        // Filter campaigns by user email
        const campaigns = await campaignCollection
          .find({ userEmail: email })
          .toArray();
        res.status(200).json(campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Error fetching campaigns.' });
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
