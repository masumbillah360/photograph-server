const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

//midlewere
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.pwgovse.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const token = req.header("authorization");
  if (!token) {
    res.status(401).send("Unauthorised Access");
  }
  try {
    const exactToken = token.split(" ")[1];
    const user = jwt.verify(
      exactToken,
      process.env.JWT_TOKEN,
      (err, decoded) => {
        if (err) {
          res.status(403).send("Invalid Token Access");
        }
        req.decoded = decoded;
        next();
      }
    );
  } catch (error) {
    res.status(403).send("Invalid Access");
  }
};

const dbHandler = async () => {
  try {
    const foodCollection = client.db("tastyBite").collection("Food");
    const reviewCollection = client.db("tastyBite").collection("Review");
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.JWT_TOKEN);
      res.send({ token });
    });
    app.get("/homeservices", async (req, res) => {
      const query = {};
      const results = await foodCollection
        .find(query)
        .limit(3)
        .sort({ date: -1 })
        .toArray();
      res.send(results);
    });
    app.get("/allservices", async (req, res) => {
      const query = {};
      const results = await foodCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(results);
    });
    app.post("/allservices", verifyJWT, async (req, res) => {
      const postInfo = req.body;
      const results = await foodCollection.insertOne(postInfo);
      res.status(200).send(results);
    });
    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = foodCollection.findOne(query);
      res.send(await data);
    });
    app.post("/review", verifyJWT, async (req, res) => {
      const review = req.body;
      const results = reviewCollection.insertOne(review);
      const data = await results;
      res.send(data);
    });

    app.get("/review", async (req, res) => {
      const postId = req.query.postId;
      // const query = { postId: postId };
      const query = {};
      const user = req.decoded;
      const review = await reviewCollection
        .find(query)
        .sort({ time: -1 })
        .toArray();
      res.send(review);
    });
    app.get("/myreviews", verifyJWT, async (req, res) => {
      const user = req.decoded;
      const email = user.email;
      const filter = { email: email };
      const reviews = reviewCollection
        .find(filter)
        .sort({ time: -1 })
        .toArray();
      const results = await reviews;
      res.send(results);
    });
    app.get("/myreviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const reviews = reviewCollection.findOne(filter);
      const results = await reviews;
      res.send(results);
    });

    app.patch("/review/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: updatedReview,
      };
      const data = reviewCollection.updateOne(filter, updatedDoc);
      const results = await data;
      res.send(results);
    });
    app.delete("/review/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const results = await reviewCollection.deleteOne(query);
      if (results.deletedCount) {
        res.send(results);
      } else {
        res.status(404).send("Please Try Again");
      }
    });
    app.get("/myservices/", verifyJWT, async (req, res) => {
      const email = req.decoded.email;
      console.log(email);
      const query = { email: email };
      const results = await foodCollection
        .find(query)
        .sort({ time: -1 })
        .toArray();
      res.send(results);
    });
    app.get("/myservices/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const results = foodCollection.findOne(query);
      const data = await results;
      res.send(data);
    });
    app.patch("/myservices/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const updatedPost = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: updatedPost,
      };
      const data = foodCollection.updateOne(filter, updatedDoc);
      const results = await data;
      res.send(results);
    });
    app.delete("/myservices/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const reviews = foodCollection.deleteOne(filter);
      const results = await reviews;
      res.send(results);
      console.log("deleteOne");
    });
  } catch (error) {
    res.status(404).send(error.message);
    console.log(error.message);
  }
};
dbHandler().catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
