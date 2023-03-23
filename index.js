const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tyqf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("jobtask").collection("heroRiderUsers");

    // all data show api
    app.get("/users", async (req, res) => {
      const page = Number(req.query.page);
      const size = Number(req.query.size);
      const searchEmail = req.query.email;
      const searchFullname = req.query.fullName;
      const searchPhone = req.query.phone;
      const query = {};
      const cursor = userCollection.find(query);
      let allUser;
      if (page || size) {
        allUser = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        allUser = await cursor.toArray();
      }
      if (searchFullname) {
        const fullName = { fullName: searchFullname };
        const findFullName = userCollection.find(fullName);
        allUser = await findFullName.toArray();
      }
      if (searchEmail) {
        const email = { email: searchEmail };
        const findEmail = userCollection.find(email);
        allUser = await findEmail.toArray();
      }
      if (searchPhone) {
        const phone = { phone: searchPhone };
        const findPhone = userCollection.find(phone);
        allUser = await findPhone.toArray();
      }
      res.send(allUser);
    });

    //register user api
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const addUser = await userCollection.insertOne(newUser);
      res.send(addUser);
    });

    //pagination
    app.get("/pagination", async (req, res) => {
      const count = await userCollection.countDocuments();
      res.send({ count });
    });

    //check admin role
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    //get profile api
    app.get("/profile", async (req, res) => {
      const profileEmail = req.query.email;
      const query = { email: profileEmail };
      const profile = await userCollection.findOne(query);
      res.send(profile);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hero Rider");
});

app.listen(port, () => {
  console.log("Hero Rider Connected", port);
});
