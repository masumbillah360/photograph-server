const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//midlewere
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_pASSWORD}@cluster0.pwgovse.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbHandler = async () => {
  try {
    const foodCollection = client.db("tastyBite").collection("Food");
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
