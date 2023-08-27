const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.87bzbwh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const usersCollection = client.db('aircncDb').collection('users')
    
    // Save user email and role in DB
    app.put('/users/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const query = {email: email};
        const options = { upsert: true};
        const updateDoc = {
            $set: user,
        }
        const result = await usersCollection.updateOne(query, updateDoc, options)
        console.log(result)
        res.send(result)
    })
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('aircnc server is running')
})

app.listen(port, ()=> {
    console.log(`Aircnc is running on port ${port}`);
})