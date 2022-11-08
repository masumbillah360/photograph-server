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

    app.get("/review", async (req, res) => {
      const query = {};
      const review = reviewCollection.find(query);
      const results = await review.toArray();
      res.send(results);
    });
    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: updatedReview,
      };
      const data = reviewCollection.updateOne(filter, updatedDoc);
      const results = await data;
      res.send(results);
      console.log(updatedDoc);
    });
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const results = await reviewCollection.deleteOne(query);
      if (results.deletedCount) {
        console.log("Deleted");
      } else {
        console.log("not deleted");
      }
      res.send(results);
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
