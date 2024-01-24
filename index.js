const express = require("express");
var cors = require("cors");
const app = express();
require("dotenv").config();
const port = 3000;
app.use(express.json());
app.use(cors());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// const profileImageUpload = require("../middlewears/user/profileImageUpload");
// const {
//   addUserValidators,
//   addUserValidatorHandler,
// } = require("../middlewears/user/userValidator");
// const {
//   loginValidator,
//   loginValidationHandler,
// } = require("../middlewears/login/loginValidator");


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.uld9vql.mongodb.net/?retryWrites=true&w=majority`;

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
// ----user

app.post(
  "/registration",
  profileImageUpload,
  addUserValidators,
  addUserValidatorHandler,
  async (req, res) => {
    try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        ...req.body,
        password: hashedPass,
        profileImage: req.files[0].filename,
      });
      if (req.files && req.files.length > 0) {
        newUser.profileImage = req.files[0].filename;
      }

      const user = await newUser.save();
      res.status(200).json({
        message: "User saved successfully",
        user: user,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: "Unknown error occurred",
          },
        },
      });
    }
  }
);

app.post("/login", async (req, res) => {
  console.log(req.body.email, req.body.password);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const isValidPass = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPass) {
        const token = jwt.sign(
          {
            username: user.name,
            userId: user._id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRY }
        );
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: Number(process.env.JWT_EXPIRY),
          httpOnly: true,
        });
        res.status(200).json({
          access_token: token,
          message: "Success",
        });
      } else {
        throw createError("Authentication Failed");
      }
    } else {
      throw createError("Authentication Failed");
    }
  } catch (err) {
    res.status(401).json({
      errors: {
        common: {
          msg: "Authentication Failed",
          err: err.message,
        },
      },
    });
  }
});


app.get("/verify-token", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ result: decodedToken, error: null });
    console.log(decodedToken);
  } catch (e) {
    res.status(401).json({ result: null, error: e.message });
  }
});



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
