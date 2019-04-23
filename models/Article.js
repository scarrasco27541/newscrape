const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// HELP: https://medium.com/@nicknauert/mongooses-model-populate-b844ae6d1ee7
const ArticleSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	summary: {
		type: String,
		required: true
	},
	notes: [{
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}] 
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
