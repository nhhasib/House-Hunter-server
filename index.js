const express = require("express");
var cors = require("cors");
const app = express();
require("dotenv").config();
const port = 3000;
app.use(express.json());
app.use(cors());

// House-Hunter
// ibs1cr9jC9D4IPj5

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://House-Hunter:ibs1cr9jC9D4IPj5@cluster0.uld9vql.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const houseCollection = client.db("HouseHunter").collection("Houses");

    app.get("/allhouses", async (req, res) => {
      console.log("houses clicked");
      const result = await houseCollection.find().toArray();
      res.send(result);
    });

    app.get("/houses/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await houseCollection.findOne(query);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
