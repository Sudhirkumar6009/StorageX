const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config({path: "./config.env"});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true // For development only
});

app.get("/api/mongo/test", async (req, res) => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    
    const result = {
      success: true,
      message: "MongoDB Connected Successfully!",
      timestamp: new Date().toISOString(),
    };
    
    res.json(result);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});