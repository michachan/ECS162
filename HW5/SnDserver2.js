var static = require('node-static');
var http  = require('http');
var sqlite3 = require("sqlite3").verbose();
var url = require('url');
let dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

var cmdStr = 'SELECT * FROM photoTags WHERE idNum in (CSLIST)';
var imageURL = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/';
// Create a node-static server instance to serve the './public' folder
var file = new static.Server('./public');
 
 
/***********************************/
/** GLOBALLY SCOPED FUNCTIONS **/
/***********************************/
// global variables
var fs = require('fs');  // file access module

//remove for part 2: var imgList = [];

// code run on startup
//remove for part 2: loadImageList();

// just for testing, you can cut this out
//console.log(imgList[354]);

/* remove for part 2
function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}*/ 
/***********************************/
/** END GLOBALLY SCOPED FUNCTIONS **/
/***********************************/


function handler (request, response) {
	var urls = request.url;
	var urlParts = urls.split('/');
	var urlType = urlParts[1].split('?');
    
    var req = url.parse(request.url, true);

	
	file.serve(request, response, function (error, result){
		if(error){
			if(urlType[0] === "query"){
				if(urlType[1]){
					var query = urlType[1].split("num=");
					if(query[1]){ //changed stuff in here
                        var indices = '(' + req.query.numList.split(" ").join(",") + ')'; //numList from the new URL
                        var responseObj = [];
                        db.each(cmdStr.replace("CSLIST", indices),
                               function(err, row) {
                                        responseObj.push({
                                            src:imageURL+row.filename, width:row.width, 
                                            height:row.height
                                        }); //end function error
                        },
                        function(err) { //callback writes as JSON
                            response.writeHead(200, {"Content-Type": "text/html"});
                            response.write(JSON.stringify(responseObj));
                            response.end();
                        });
						query = query[1];
						if(query > -1 && query < 990){
							query = query.replace(/^0+/, '');
							response.write(imgList[query]);
						} else {
							response.writeHead(404, {"Content-Type": "text/html"});
							response.write("Bad Query");
                            response.write("Parameter missing: numList.")
                            response.end();
                        }
					} else {
						response.write("No argument passed.");
					}
				} else {
					response.write("No argument passed.");
				}
			} else {
				file.serveFile('/404.html',404, {"Content-Type": "text/html"}, request, response);
				//response.writeHead(404, );
			}
		}
	});
}

var server = http.createServer(handler);
//server.listen("56965");
server.listen("8000", '127.0.0.1');
