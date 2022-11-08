const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//midlewere
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_pASSWORD}@cluster0.pwgovse.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbHandler = async () => {
  try {
    const foodCollection = client.db("tastyBite").collection("Food");
    const reviewCollection = client.db("tastyBite").collection("Review");
    app.get("/homefood", async (req, res) => {
      const query = {};
      const results = await foodCollection.find(query).limit(3).toArray();
      res.send(results);
    });
    app.get("/allfood", async (req, res) => {
      const query = {};
      const results = await foodCollection.find(query).toArray();
      res.send(results);
    });
    app.get("/allfood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = foodCollection.findOne(query);
      res.send(await data);
    });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const results = reviewCollection.insertOne(review);
      const data = await results;
      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};
dbHandler().catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(uri);
});
