const express = require('express');
const app = express();
const morgan = require('morgan')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const roomsCollection = client.db('aircncDb').collection('rooms')
    const bookingsCollection = client.db('aircncDb').collection('bookings')
    
    
    // Generate jwt token
    app.post('/jwt', (req, res) =>{
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET,
       {expiresIn: '7d'})
      console.log(token)
      res.send({token})
    })

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

    // Get User Role
    app.get('/users/:email', async (req, res) =>{
      const email = req.params.email
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      console.log(result)
      res.send(result)
    })

    // Get all rooms
    app.get('/rooms', async (req, res) =>{
      const result = await roomsCollection.find().toArray()
      res.send(result)
    })

    //delete room
    app.delete('/rooms/:id', async (req, res) =>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.deleteOne(query)
      res.send(result)
    })

    // Get rooms of host
    app.get('/rooms/:email', async (req, res) =>{
      const email = req.params.email
      const query = { 'host.email': email}
      const result = await roomsCollection.find(query).toArray()
      console.log(result)
      res.send(result)
    })

    // Get a single room
    app.get('/room/:id', async (req, res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await roomsCollection.findOne(query)
      console.log(result)
      res.send(result)
    })

    // Save a room in database
    app.post('/rooms', async (req, res) =>{
      const room = req.body
      console.log(room)
      const result = await roomsCollection.insertOne(room)
      res.send(result)
    })

    // update room booking status
    app.patch('/rooms/status/:id', async (req, res) =>{
      const id = req.params.id
      const status = req.body.status
      const query = { _id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          booked: status,
        },
      }
      const update = await roomsCollection.updateOne(query, updateDoc)
      res.send(update)
    })

    // Get bookings for guest
    app.get('/bookings', async (req, res) =>{
      const email = req.query.email
      if(!email){
        res.send([])
      }
      const query = { 'guest.email': email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })

    // Get booked room for Host
    app.get('/bookings/host', async (req, res) =>{
      const email = req.query.email
      if(!email) {
        res.send([])
      }
      const query = {host: email }
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })

    // Save booking in database
    app.post('/bookings', async (req, res) =>{
      const booking = req.body
      console.log(booking)
      const result = await bookingsCollection.insertOne(booking)
      res.send(result)
    })

    // delete a booking
    app.delete('/bookings/:id', async (req, res) =>{
      const id = req.params.id
      const query = { _id: new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query)
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