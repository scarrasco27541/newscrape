
function deleteNote(article_id, note_id) {
	if (confirm("Are you sure you want to delete this Note?")) {
		try {
			$.get("/article/"+article_id+"/note/"+note_id+"/delete"
				, (res) => {
					loadArticles();
				}
			);
		} catch(err) { 
			alert(err);
		};
		loadArticles();
	}
}

function drawNotes(container, article) {
	container.empty();
	if (article.notes.length > 0) {
		let h = $("<h3>").text("Notes");
		container.append(h);
		for (let n in article.notes) {
			let div = $("<div>").addClass("note");
			let strong = $("<strong>").text(article.notes[n].title);
			let a = $("<a>").attr("href", "javascript:;").addClass("deleter").text("[X]");
			a.on("click", () => {
				deleteNote(article._id, article.notes[n]._id);
			});
			strong.prepend(a);
			let p = $("<p>").text(article.notes[n].body);
			div.append(strong);
			div.append(p);
			container.append(div);
		}
	}
}


function drawArticle(article) {
	let div = $("<div>").addClass("article").attr("id", "article_"+article._id);
	let header = $("<h3>");
	let ahref = $("<a>").text(article.title).attr("href", article.link).attr("target", "_blank");
	header.append(ahref);
	div.append(header);
	$("#articles").append(div);
	let p = $("<p>").text(article.summary);
	div.append(p);
	let btnAddNote = $("<button>").text("Add Note").addClass("open-button");
	div.append(btnAddNote);
	btnAddNote.on("click", () => {
		openCommentForm(article._id);
	});
	let divNotes = $("<div>").attr("id", "notes_"+article._id).addClass("notes");
	div.append(divNotes);
	drawNotes(divNotes, article);
}

function scrapeArticles() {
	$("#pleasewait").css("display","block");
	$("#articles").empty();
	$.get("/scrape/", (x) => {
		loadArticles();
		$("#pleasewait").css("display","none");
	});
}
function clearArticles() {
	$.get("/clear/", (x) => {
		loadArticles();
	});
}

function loadArticles() {
	$("#articles").html("");
	$.get("/articles/", (articles) => {
		for (let a in articles) {
			drawArticle(articles[a]);
		}
	});
}

function openCommentForm(article_id) { 
	console.log(article_id);
	$("#commentForm").css("display", "block");
	$("#note_article_id").val(article_id);
}

function addArticleNote(article_id, note_title, note_body) {
	console.log(article_id, note_title, note_body);
	try {
		$.post("/article/"+article_id+"/comment"
			, { title: note_title, body: note_body}
			, (res) => {
				$("#commentForm").css("display", "none");
				loadArticles();
			}
		);
	} catch(err) { 
		console.log(err);
	};
}

$("#btnClear").on("click", () => {
	clearArticles();
});
$("#btnScrape").on("click", () => {
	scrapeArticles();
});
$("#btnSubmitNote").on("click", () => {
	addArticleNote($("#note_article_id").val(), $("#note_title").val(), $("#note_body").val()); 
});
$("#btnCloseCommentForm").on("click", () => {
	$("#commentForm").css("display", "none");
});

loadArticles();