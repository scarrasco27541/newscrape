require('dotenv').config();

const path = require("path");
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const PORT = process.env.PORT || 8080;
const DBURL = process.env.MONGODB_URI || "mongodb://localhost:27017/newscrape";

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
		$(".digg-story__content").each((i, element) => {
			let result = {};
			result.summary = $(element).find(".js--digg-story__ellipsis-truncate").text();
			result.link = $(element).find(".digg-story__title-link").attr("href");
			result.title = $(element).find(".digg-story__title-link").text();
//			console.log(result);
			db.Article.create(result).then(dbArticle => {
				console.log(dbArticle);
			})
			.catch(err => {
				console.log(err);
			});
		});
		res.send("Scrape Complete");
	});
});


app.get("/notes", (req, res) => {
  db.Note.find({})
    .then(dbNote => {
      res.json(dbNote);
    })
    .catch(err => {
      res.json(err);
    });
});


app.get("/articles", (req, res) => {
  db.Article.find({})
	.populate('notes').exec()
    .then(dbArticles => {
      res.json(dbArticles);
    })
    .catch(err => {
      res.json(err);
    });
});


app.get("/article/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});


app.get("/article/:article_id/note/:note_id/delete", (req, res) => {
	try {
		db.Note.deleteMany({_id: req.params.id}, function() {
			db.Article.findOneAndUpdate({ _id: req.params.article_id }
				, {$pull:{ notes: req.params.note_id }}).then(dbArticle => {
					res.json({success:"deleted"});
				}).catch(er =>{
					console.log(er);
				});
		});
	} catch(er) {
		console.log(er);
		res.json(er);
	}
});

app.get("/clear", (req, res) => {
	try {
		db.Note.remove({}, function() {
			db.Article.remove({}, function() {
				res.send({success:"cleared"});
			});
		});
	} catch(er) {
		console.log(er);
		res.json({error:er});
	}
});





// HELP: https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
app.post("/article/:id/comment", (req, res) => {
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{ notes: dbNote._id }});
//      return db.Article.findOneAndUpdate({ _id: req.params.id }, { notes: dbNote._id }, { new: true });
    })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    });
});



app.listen(PORT, () => {
  console.log("App running on port " + PORT);
});

