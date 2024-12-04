const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 8000;
const app = express();

//aaaaahshanhabib
//b2zPqQIaxDArXuON

// middle ware
app.use(cors());
app.use(express.json());

// // todo: mongodb connecting server
// const uri =
//   'mongodb+srv://aaaaahshanhabib:b2zPqQIaxDArXuON@cluster0.ing8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const database = client.db('usersDb');
//     const userCollection = database.collection('users');

//     app.get('/users', async (req, res) => {
//       const curser = userCollection.find();
//       const result = await curser.toArray();
//       res.send(result);
//     });

//     app.get('/users/:id', async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const user = await userCollection.findOne(query);
//       res.send(user);
//     });

//     app.post('/users', async (req, res) => {
//       const user = req.body;
//       console.log(user);

//       const result = await userCollection.insertOne(user);
//       res.send(result);
//     });

//     app.delete('/users/:id', async (req, res) => {
//       const id = req.params.id;
//       console.log('Please delate from database', id);

//       const query = { _id: new ObjectId(id) };
//       const result = await userCollection.deleteOne(query);

//       res.send(result);
//     });

//     await client.db('admin').command({ ping: 1 });
//     console.log(
//       'Pinged your deployment. You successfully connected to MongoDB!'
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Crowd cube server is Running ');
});

app.listen(port, () => {
  console.log(`simple crud is running port : ${port}`);
});
