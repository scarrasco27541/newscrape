const path = require("path");
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const PORT = 3005;
const DBURL = "mongodb://localhost:27017/newscrape";

// --^ config stuff ^ --

const cheerio = require("cheerio");
const db = require("./models");
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(DBURL, { useNewUrlParser: true });

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "./index.html"));
});

/*
http://digg.com/api/channel/feed.json?full_text=false&format=json&position=0&slug=science
actually works, but decided to mess with the web page to use cheerio instead
*/
app.get("/scrape", (req, res) => {
  axios.get("http://digg.com/channel/science").then(response => {
    const $ = cheerio.load(response.data);
    $(".digg-story__title-link").each((i, element) => {
      const result = {};
//      result.title = $(element).children("a").text();
      result.link = $(element).attr("href");
      result.title = $(element).text();
      db.Article.create(result)
        .then(dbArticle => {
          console.log(dbArticle);
        })
        .catch(err => {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});



app.get("/articles", (req, res) => {
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/article/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});


// To test: need an html form to post from
app.post("/article/:id", (req, res) => {
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});




app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

