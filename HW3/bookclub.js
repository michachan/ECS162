window.global = {};
window.global.bookList = [];
window.global.myList = [];
/* Called when the user pushes the "submit" button */
/* Sends a request to the API using the JSONp protocol */
function newRequest(searcher) {
	document.getElementById("main-container").setAttribute('style','display:none');
	document.getElementById('searchby').setAttribute('style','display:none');
	document.getElementById('search-button').getElementsByTagName('button')[0].setAttribute('style','display:none');
    document.getElementById("sticky-header").setAttribute('style','display:flex');
    if(searcher == 'main-container') {
		var parent = document.getElementById('main-container');
		var title = parent.querySelector("#title").value;
		var author = parent.querySelector("#author").value;	
		var isbn = parent.querySelector("#isbn").value;
    } else {
		var parent = document.getElementById('sticky-header');
		var title = parent.querySelector('#title').value;
		var author = parent.querySelector('#author').value;	
		var isbn = parent.querySelector('#isbn').value;	
    }
	title = title.trim();
	title = title.replace(" ","+");
	author = author.trim();
	author = author.replace(" ","+");
	isbn = isbn.trim();
	isbn = isbn.replace("-","");

	// Connects possible query parts with pluses
	var query = ["",title,author,isbn].reduce(fancyJoin);

	// The JSONp part.  Query is executed by appending a request for a new
	// Javascript library to the DOM.  It's URL is the URL for the query. 
	// The library returned just calls the callback function we specify, with
	// the JSON data we want as an argument. 
	if (query != "") {

		// remove old script
		var oldScript = document.getElementById("jsonpCall");
		if (oldScript != null) {
			document.body.removeChild(oldScript);
		}
		// make a new script element
		var script = document.createElement('script');

		// build up complicated request URL
		var beginning = "https://www.googleapis.com/books/v1/volumes?q="
		var callback = "&callback=handleResponse"

		script.src = beginning+query+callback	
		script.id = "jsonpCall";

		// put new script into DOM at bottom of body
		document.body.appendChild(script);	
		}

}


/* Used above, for joining possibly empty strings with pluses */
function fancyJoin(a,b) {
    if (a == "") { return b; }	
    else if (b == "") { return a; }
    else { return a+"+"+b; }
}


/* The callback function, which gets run when the API returns the result of our query */
/* Replace with your code! */
function handleResponse(bookListObj) {
	var bookList = bookListObj.items;

	/* where to put the data on the Web page */ 
	var bookDisplay = document.getElementById("bookDisplay");

	/* write each title as a new paragraph */
	for (i=0; i<bookList.length; i++) {
		var book = bookList[i];
		console.log(book);
		var title = book.volumeInfo.title;
		try {
			var image = book.volumeInfo.imageLinks.thumbnail; // might be undefined;
		} catch(error){
			var image = null;
			console.log(error);
		}
		try {
			var description = book.volumeInfo.description;
		} catch(error){
			var description = null;
		}
		try {
			var author = book.volumeInfo.authors[0];
		} catch(error) {
			var author = null;
		}
		console.log(title);
		console.log(image);
		console.log(author);
		console.log(description);
		if (description){
			var shortDesc = description.split(' ').slice(0,20).join(' ')+"...";
		} else {var shortDesc = "";}
		console.log(shortDesc);
		if(!image){
			image = 'no-image.jpeg';
		}
		var b = {"title": title, "image": image, "author": author, "shortDesc": shortDesc};
		console.log(b);
		window.global.bookList.push(b);
		console.log(window.global.bookList);
		//var titlePgh = document.createElement("p");
		/* ALWAYS AVOID using the innerHTML property */
		//titlePgh.textContent = title;
		//bookDisplay.append(titlePgh);
	}
	enableOverlay();
	pushBookData(window.global.bookList,0);
}
function pushBookData(bookList,i){
	if(i !== bookList.length){
		var next = i+1;
	} else {
		var next = 0;
	}
	if(i !== 0){
		var back = i-1;
	} else {
		var back = bookList.length-1;
	}
	document.getElementById('overlay').getElementsByClassName('left_arrow')[0].setAttribute('goTo',back);
	document.getElementById('overlay').getElementsByClassName('right_arrow')[0].setAttribute('goTo',next);
	currentBook = bookList[i];
	//var overlay = document.getElementById('overlay');
	document.getElementById('overlay').getElementsByClassName('thumb')[0].src = currentBook.image;
	document.getElementById('overlay').getElementsByClassName('pre-title')[0].textContent = currentBook.title;
	document.getElementById('overlay').getElementsByClassName('pre-author')[0].textContent = "by "+currentBook.author;
	document.getElementById('overlay').getElementsByClassName('pre-desc')[0].textContent = currentBook.shortDesc;
}

function keepBook(){
	var initNode = document.getElementById('top-preview').getElementsByClassName('overlay_tile')[0];
	var cloneNode = initNode.cloneNode(true);
	var leftClone = cloneNode.getElementsByClassName('left-preview')[0];
	var close = document.createElement('span');
	close.className += "boxClose";
	close.setAttribute('onclick','removeBook(this)');
	var closeContent = document.createTextNode('\u24E7');
	close.appendChild(closeContent);
	
	cloneNode.insertBefore(close,leftClone);
	document.getElementById('bookDisplay').appendChild(cloneNode);
	disableOverlay();
}
function removeBook(bookNode){
	bookNode.parentNode.remove();
}

function enableOverlay() {
    document.getElementById("overlay").style.display = "block";
}

function disableOverlay() {
    document.getElementById("overlay").style.display = "none";
	window.global.bookList = [];
}
