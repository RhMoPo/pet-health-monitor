const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const uri = "mongodb+srv://rmp71171:fVp6KEodxmXA3M71@cluster0.wdqbrfa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let claimsCollection;

async function connectDB() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // Access the petInsurance database and claims collection
        const database = client.db('petInsurance');
        claimsCollection = database.collection('claims');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if unable to connect to the database
    }
}

connectDB().catch(console.error);

app.post('/submit-claim', async (req, res) => {
    try {
        const claim = req.body;
        const result = await claimsCollection.insertOne(claim);
        res.json({ _id: result.insertedId, ...claim });
    } catch (error) {
        console.error('Error submitting claim:', error);
        res.status(500).send('Error submitting claim');
    }
});

app.get('/claims', async (req, res) => {
    try {
        const claims = await claimsCollection.find().toArray();
        res.json(claims);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).send('Error fetching claims');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
