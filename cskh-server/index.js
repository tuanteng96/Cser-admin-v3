import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import call from "./routers/call.js";

const app = express();
const PORT = process.env.port || 5000;

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());

app.use("/call", call);

app.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
