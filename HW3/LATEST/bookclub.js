
/* Called when the user pushes the "submit" button */
/* Sends a request to the API using the JSONp protocol */
function newRequest(searcher) {
    document.getElementById("main-container").style.display = 'none';
    document.getElementById("sticky-header").style.display = 'block';

    if(searcher == 'main-container') {
    var parent = document.getElementById('main-container');
	var title = parent.querySelector("#title").value;
	var author = parent.querySelector("#author").value;	
	var isbn = parent.querySelector("#isbn").value;
	
    }
    
    else {
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
		var title = book.volumeInfo.title;
		var titlePgh = document.createElement("p");
		/* ALWAYS AVOID using the innerHTML property */
		titlePgh.textContent = title;
		bookDisplay.append(titlePgh);
	}	
}

function overlayOn() {
    document.getElementById("overlay").style.display = "flex";
    
    
}

function overlayOff() {
    document.getElementById("overlay").style.display = "none";
}


