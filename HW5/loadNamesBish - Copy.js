var fs = require("fs"); //fs library
var imageJson = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var sqlite3 = require("sqlite3").verbose(); //sqlite library
var sizeOf = require('image-size');
var url = require('url');
var http = require('http');
var sizeCBString = 'INSERT INTO photTags VALUES ( INDEX, "FILENAME", WIDTH, HEIGHT)';

let dbFileName = "PhotoQ.db";
//check if PhotoQ.db exists, if it does make db variable 
var db = new sqlite3.Database(dbFileName);
var imageCounter = 0; //used to check if we've inserted all the images

http.globalAgent.maxSockets = 1;

for(var i = 0; i < imageJson.length; i++) {
    console.log("Starting the process for image", i);
    getSize(i, imageJson[i], sizeCB);
}

function getSize(index, name, callback) {//image-size module code provided //cbFun1 = sizeCB //cbFun2 = dbCB I think we need to include both of these so when we call cbFun1 we can pass cbFun2 as a parameter
    var imageURL = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/' + name;
    var options = url.parse(imageURL);
    http.get(options, function (response) {
      var chunks = [];
      response.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function() {
        var buffer = Buffer.concat(chunks);
        console.log(sizeOf(buffer)); //does cnFun have access to dims?
        callback(index, name, sizeOf(buffer));
      });
    });
}

function sizeCB(index, name, dims) { //cb fun is dbCB here
    var string = sizeCBString.replace("INDEX", index);
    string = sizeCBString.replace("FILENAME", name);
    string = sizeCBString.replace("WIDTH", dims.width);
    string = sizeCBString.replace("HEIGHT", dims.height);
    
    console.log("Finished inserting photo", index, "complete.");
    
    db.run(string, dbCB);
}

function dbCB() {
    imageCounter++;
    if(imageCounter == 989)
        db.close();
}