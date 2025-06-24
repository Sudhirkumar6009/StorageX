import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoPing from "./Mongo/mongoPing.js";
import mongoProfile from "./Profile/mongoProfile.js";
import storePublicAddressMongo from "./Mongo/storePublicAddressMongo.js";
import fetchProfile from "./Profile/fetchProfile.js";
import listoutFiles from "./Filebase/listoutFiles.js";
import deleteFile from "./Filebase/deleteFile.js";
import uploadFile from "./Filebase/uploadFile.js";
import cidMatchingMongo from "./Mongo/cidMatchingMongo.js";
import googleAccount from "./Signin/googleAccount.js";
import cors from "cors";

dotenv.config({ path: "./.env" });

const app = express();
app.use(
  cors({
    origin: [
      "https://storage-x-lilac.vercel.app",
      "http://localhost:8080",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  })
);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(mongoPing);
app.use(mongoProfile);
app.use(storePublicAddressMongo);
app.use(fetchProfile);
app.use(uploadFile);
app.use(listoutFiles);
app.use(deleteFile);
app.use(cidMatchingMongo);
app.use(googleAccount);

app.listen(PORT, () => {
  console.log(`Backend server running on ${process.env.BACKEND_PORT_URL}`);
});
