var fs = require('fs');  // file access module
var imgList = [];
// Globals
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");

var dbFileName = "PhotoQ.db";
// makes the object that represents the database in our code
var db = new sqlite3.Database(dbFileName);
var url = require('url');
var http = require('http');
http.globalAgent.maxSockets = 1;
var sizeOf = require('image-size');


// code run on startup
loadImageList();


var num_callbacks = 0;

for (var i = 0; i < imgList.length; i++) {
    var temp = imgList[i].replace("&#39;", "%26%2339%3b");
    getSize(i, temp, cbFun);
}

//Call back function for database calls
function dbCallback(err) {
    if (err) {
        console.log(err);
    }
    num_callbacks++;
    console.log(num_callbacks);
    if (num_callbacks == imgList.length) {
        console.log('finished...');
        db.close();
        dumpDB();
    }
 }

//Function to Load up JSON
function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}

//Dump database
function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
      function dataCallback( err, data ) {
		console.log(data)
      }
}

function getSize(ind, name, cbFun) {
    var imgURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + name;

    var options = url.parse(imgURL);

    // call http get
    http.get(options, function (response) {
	var chunks = [];
	response.on('data', function (chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var buffer = Buffer.concat(chunks);
	    dimensions = sizeOf(buffer);
	    cbFun(ind, name, dimensions.width, dimensions.height);
	})
    })
}

function cbFun (ind, name, width, height) {

    var insert = "INSERT OR REPLACE INTO photoTags VALUES ('";
    var middle = "', '";
    var landmark = '';
    var tag = '';

    cmdStr = insert + ind + middle + name + middle + width + middle + height + middle + landmark + middle + tag + middle.slice(0,1) + ")";
    console.log("Executing the following SQL: \n" + cmdStr);
    db.run(cmdStr, dbCallback);

}
