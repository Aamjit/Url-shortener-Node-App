require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const dns = require("dns");
const url = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// connection to database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MDB, (err) => {
  if (err) {
    console.log("Connection to Mongo failed.");
  } else {
    console.log("Connection successful");
  }
});

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
  console.log(`click on http://localhost:${port}`);
});


let URLmodel = mongoose.model(
  "ShortURL",
  new mongoose.Schema({
    ShortUrl: String,
    AddedDate: Date,
    Original_URL: String,
  })
);

app.post("/api/shorturl", (req, res) => {
  // make sure to mount body parser
  let oriUrl = req.body.url;
  let id = shortid.generate();

  dns.lookup(url.parse(oriUrl).hostname, (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      const urlToBeInserted = new URLmodel({
        ShortUrl: id,
        AddedDate: new Date(),
        Original_URL: oriUrl,
      });

      urlToBeInserted.save((err, data) => {
        if (err) {
          console.log("Data instertion failed.");
        } else {
          console.log("Data insterted successfully.");
        }
      });
      res.json({ original_url: oriUrl, short_url: id });
    }
  });
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  const id = req.params.shorturl;
  URLmodel.findOne({ ShortUrl: id }, (err, data) => {
    if (!data) {
      console.log(err);
      res.json({ error: "invalid url" });
    } else {
      console.log(data);
      res.redirect(data.Original_URL);
    }
  });
});
