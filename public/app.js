
/*
function drawNotes(container, article_id) {
	let div = $("<div>").addClass("note");
	let strong = $("<strong>").text("Title");
	div.text("blah");
	container.append(div);
}
*/

function drawArticle(article) {
	let div = $("<div>").addClass("article");
	let header = $("<h3>");
	let ahref = $("<a>").text(article.title).attr("href", article.link).attr("target", "_blank");
	header.append(ahref);
	div.append(header);
	$("#articles").append(div);
//	let notesdiv = $("<div>").addClass("notes");
//	div.append(notesdiv);
//	drawNotes(notesdiv, article._id);
}

function loadArticles() {
	$("#articles").html("");
	$.get("/articles/", function(articles) {
		for (let a in articles) {
			drawArticle(articles[a]);
		}
	});
}

loadArticles();