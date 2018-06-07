var imageJson = require('./6whs.json');
var sqlite3 = require("sqlite3").verbose(); //sqlite library
var fs = require("fs"); //fs library
var sizeOf = require('image-size');
var url = require('url');
var http = require('http');

let dbFileName = "PhotoQ.db";

//check if PhotoQ.db exists, if it does make db variable 
var db = new sqlite3.Database(dbFileName);
var imageCounter;

//insert one row into the langs table
//documented code
let sql = 'INSERT INTO photoTags(idNum, fileName, width, height, location, tags) VALUES(?,?,?,?,?,?)';
    
for (imageCounter = 0; imageCounter < imageJson.length; i++) {
    sizeOf(imageJson[imageCounter]);

        db.run(sql, [imageCounter, 'string1', dimensions.width, dimension.height, 'string2', 'string3'], function(err)) { //insert 
               if(err) {
                    return console.log(err.message);   
                }
                console.log('A row has been inserted with rowid ${this.lastID}');
        });
});
db.close();

//image-size module code provided 
var options = url.parse(imageJson);
http.get(options, function (response) {
  var chunks = [];
  response.on('data', function (chunk) {
    chunks.push(chunk);
  }).on('end', function() {
    var buffer = Buffer.concat(chunks);
    console.log(sizeOf(buffer));
  });
});