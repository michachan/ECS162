//AIzaSyBwFTyNG2_mOZANvzPZqPQHSHwMp7b_-cc
// Node module for working with a request to an API or other fellow-server
var APIrequest = require('request');


// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below
/*APIrequestObject = {
  "requests": [
    {
      "image": {
        "source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"}
        },
      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
    }
  ]
}*/
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");
var dbFileName = "PhotoQ.db";
// makes the object that represents the database in our code
var db = new sqlite3.Database(dbFileName);

var imgList = [];
// code run on startup
loadImageList();
// just for testing, you can cut this out
//console.log(imgList[354]);

/*function loadImageList () {
    var data = fs.readFileSync('6whs.json');
    if (! data) {
	    console.log("cannot read 6whs.json");
    } else {
	    listObj = JSON.parse(data);
	    //imgList = listObj.photoURLs;
		//console.log(listObj);
		parseList(listObj);
    }
}*/
function loadImageList(){
	var n = 0;
	db.all('SELECT * FROM photoTags', function(err,rows){
		rows.forEach(function(row){
			if(n < 20){
				n++;
				console.log(row);
				var ref = row.idNum;
				let imageName = encodeURI(row.src);
				let imageURL = `http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/${imageName}?ref=${ref}`;
				APIrequestObject = {"requests":[]};
				let x = new imageItem(imageURL);
				APIrequestObject.requests.push(x);
				spreadRequests(APIrequestObject,n);
			}
		});
	});
}
function spreadRequests(APIrequestObject,n){
	setTimeout(function(){
		annotateImage(APIrequestObject);
	},1000*n);
}

function imageItem(image){
	this.image = {};
	this.image.source = {};
	//this.image.source.imageUri = image.url;
	this.image.source.imageUri = image;
	this.features = [];
	this.features[0] = {"type": "LABEL_DETECTION"},
	this.features[1] = {"type": "LANDMARK_DETECTION"};
}
/*function parseList(imgList){
	APIrequestObject = {"requests":[]};
	for(var i=0;i<imgList.length;i++){
		//console.log(imgList[i]);
		let x = new imageItem(imgList[i]);
		//console.log(x);
		APIrequestObject.requests.push(x);
	}
	//console.log(APIrequestObject);
}*/



// URL containing the API key 
// You'll have to fill in the one you got from Google
url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBwFTyNG2_mOZANvzPZqPQHSHwMp7b_-cc';


// function to send off request to the API
function annotateImage(APIrequestObject) {
	// The code that makes a request to the API
	// Uses the Node request module, which packs up and sends off 
	// an HTTP message containing the request to the API server
	APIrequest(
	    { // HTTP header stuff
		url: url,
		method: "POST",
		headers: {"content-type": "application/json"},
		// will turn the given object into JSON
		json: APIrequestObject
	    },
	    // callback function for API request
	    APIcallback
	);

	// callb ack function, called when data is received from API
	function APIcallback(err, APIresponse, body) {
    	if ((err) || (APIresponse.statusCode != 200)) {
			console.log("Got API error");
			console.log(body);
    	} else {
			APIresponseJSON = body.responses[0];
			//console.log(APIresponseJSON);
			var o = [];
			var landmark;
			let tags = APIresponseJSON.labelAnnotations;
			if(APIresponseJSON.landmarkAnnotations){
				landmark = APIresponseJSON.landmarkAnnotations[0].description;
			}
			if(tags){
				for(var i=0;o.length < 6 && i<tags.length;i++){
					o.push(tags[i].description);
				}
			}
			dbCallback(landmark,o);
		}		
    } // end callback function
	function dbCallback(landmark,o){
		console.log(APIrequestObject);
		console.log(APIrequestObject.requests[0].image.source.imageUri);
		let url = APIrequestObject.requests[0].image.source.imageUri;
		let id = url.split('ref=')[1];
		db.serialize(function(){
			console.log(id);
			console.log(landmark);
			console.log(o);
			//let sql = `UPDATE photoTags SET tags = ${landmark}`;
		});
	}
}


// Do it! 
//annotateImage();