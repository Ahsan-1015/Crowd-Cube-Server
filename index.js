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

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khjiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB connection URI from environment variables
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ing8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const database = client.db('campaignDb');
    const campaignCollection = database.collection('campaigns');
    const donatedCollection = database.collection('donated'); // New collection for donations

    // Get all campaigns
    app.get('/campaigns', async (req, res) => {
      try {
        // Sort campaigns by createdAt field (most recent first)
        const cursor = campaignCollection.find().sort({ createdAt: -1 }); // -1 for descending order (latest first)

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

    // Backend sorting for campaigns
    app.get('/campaigns', async (req, res) => {
      const sortOrder = req.query.sort === 'desc' ? -1 : 1; // Ascending by default
      try {
        const cursor = campaignCollection
          .find()
          .sort({ minDonation: sortOrder });
        const campaigns = await cursor.toArray();
        res.status(200).json(campaigns);
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

    // POST - Add campaign (with userEmail)
    app.post('/campaigns', async (req, res) => {
      const data = req.body;
      if (!data.userEmail) {
        return res.status(400).json({ message: 'User email is required.' });
      }

      // Add createdAt field to the campaign data
      const newCampaign = {
        ...data,
        createdAt: new Date(), // Current timestamp
      };

      try {
        const result = await campaignCollection.insertOne(newCampaign);
        res.status(201).json(result);
      } catch (error) {
        console.error('Error adding campaign:', error);
        res.status(500).json({ message: 'Error adding campaign.' });
      }
    });

    // delate
    app.delete('/campaigns/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await campaignCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: 'Campaign deleted successfully' });
        } else {
          res.status(404).json({ error: 'Campaign not found' });
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
      }
    });

    // Update a campaign
    app.put('/campaigns/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        const result = await campaignCollection.updateOne(
          { _id: new ObjectId(id) }, // Match the campaign by ID
          { $set: updatedData } // Update with new data
        );

        if (result.matchedCount > 0) {
          res.status(200).json({ message: 'Campaign updated successfully!' });
        } else {
          res.status(404).json({ error: 'Campaign not found.' });
        }
      } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update the campaign.' });
      }
    });

    // New POST endpoint for donations
    app.post('/donate', async (req, res) => {
      const { campaignId, userEmail, username, minDonation, description } =
        req.body;

      // Validate required fields
      if (!campaignId || !userEmail || !username || !minDonation) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Fetch the campaign to get the minimum donation amount
      const campaign = await campaignCollection.findOne({
        _id: new ObjectId(campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Validate the donation amount
      if (parseFloat(minDonation) < parseFloat(campaign.minDonation)) {
        return res
          .status(400)
          .json({ error: `Minimum donation is $${campaign.minDonation}.` });
      }

      // Construct donation data
      const newDonation = {
        campaignId: new ObjectId(campaignId),
        userEmail,
        username,
        minDonation,
        description, // Include the description in the donation data
        donatedAt: new Date(),
      };

      try {
        const result = await donatedCollection.insertOne(newDonation);

        res.status(201).json({
          message: 'Donation successfully recorded!',
          donationId: result.insertedId,
        });
      } catch (error) {
        console.error('Error inserting donation:', error);
        res.status(500).json({ error: 'Failed to record donation' });
      }
    });

    // In your backend file, modify the /myDonations route to join campaign data
    app.get('/myDonations', async (req, res) => {
      const { userEmail } = req.query;

      if (!userEmail) {
        return res
          .status(400)
          .json({ message: 'Email query parameter is required.' });
      }

      try {
        // Fetch donations
        const donations = await donatedCollection
          .aggregate([
            {
              $match: { userEmail }, // Filter by user email
            },
            {
              $lookup: {
                from: 'campaigns',
                localField: 'campaignId',
                foreignField: '_id',
                as: 'campaignData',
              },
            },
            {
              $unwind: '$campaignData', // Unwind the campaign data array
            },
          ])
          .toArray();

        res.status(200).json(donations); // Return the donations with campaign data
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donations' });
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
