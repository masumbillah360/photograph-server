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
      const results = await foodCollection
        .find(query)
        .limit(3)
        .sort({ date: -1 })
        .toArray();
      res.send(results);
    });
    app.get("/allfood", async (req, res) => {
      const query = {};
      const results = await foodCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(results);
    });
    app.post("/allfood", async (req, res) => {
      const postInfo = req.body;
      console.log(postInfo);
      const results = await foodCollection.insertOne(postInfo);
      res.status(200).send(results);
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
      const postId = req.query.postId;
      // const email = req.query.email;
      const query = { postId: postId };
      const review = reviewCollection.find(query);
      const results = await review.toArray();
      res.send(results);
    });
    app.get("/myreviews", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const filter = { email: email };
      const reviews = await reviewCollection.find(filter).toArray();
      res.send(reviews);
    });
    app.get("/myreviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const reviews = reviewCollection.findOne(filter);
      const results = await reviews;
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
      const query = { _id: ObjectId(id) };
      const results = await reviewCollection.deleteOne(query);
      if (results.deletedCount) {
        res.send(results);
      } else {
        res.status(404).send("Please Try Again");
      }
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
});
