//Require statements at the top
var http = require('http');
var static = require('node-static');
var fileServer = new static.Server('./public');
var fs = require('fs');  // file access module
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);
var auto = require("./makeTagTable");

var tagTable = {};   // global
auto.makeTagTable(tagTableCallback);
function tagTableCallback(data) {
	tagTable = data;
}

// Logic:
//     If the link contains the word query DONE
//         dynamically answer like miniserver.js DONE
//     else its a static request DONE
//         handle the static request DONE
//         if its a page you dont have DONE
//             respond with a 404 page DONE

function construct_sql(cmd) {
    var split_cmd = String(cmd).split(",");
    var sql = `SELECT * FROM photoTags WHERE `

    for (var i=0; i < split_cmd.length; i++) {
        var each_split = `(landmark LIKE "%${split_cmd[i]}%" OR tags LIKE "%${split_cmd[i]}%") `;
        if (i == split_cmd.length - 1) {
            sql = sql + each_split;
        } else {
            sql = sql + each_split + "AND ";
        }
    }

    console.log(sql);
    return sql;
}

function sendFiles (request, response) {
    var url = request.url;
    var q = url.split("/")[1];

    // Error checking
    if (q.startsWith('query?keyList=') == false && q.includes('query') == false && q.includes('deleteTag?') == false && q.includes('addTag?') == false) {
		request.addListener('end', findFile).resume();
    } else if(q.startsWith('query?autocomplete')){
		console.log(url);
		var query = url.split('?autocomplete=')[1];
		var x = tagTable[query];
		if(x){
			let res = JSON.stringify(x);
			response.write(res);
		} else {
			let o = {};
			o.tags = {};
			let res = JSON.stringify(o);
			response.write(res);
		}
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
	} else if (q.startsWith('deleteTag?') || q.startsWith('addTag?')) {

		if (q.startsWith('deleteTag?')) {
			var query = url.split('deleteTag?')[1];
		} else {
			var query = url.split('addTag?')[1];
		}

		query = query.split("&");
		var idNum = query[0].split("=");
		idNum = idNum[1];
		var tag = query[1].split("=");
		tag = decodeURIComponent(String(tag[1]));

		console.log(tag);
		console.log(idNum);

		if (q.startsWith('deleteTag?')) {
			update_tag(idNum, tag, 'delete');
		}

		if (q.startsWith('addTag?')) {
			update_tag(idNum, tag, 'add');
		}

		//TODO do we need this?
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();


	}

	else {
		console.log(url);
        // if valid number of list of valid numbers
        // this function should return 0, else -1
        url = String(handle_url(url));
        url = decodeURIComponent(url);


        //TODO need a better check here BUG
        if (url) {

            //Construct sql based off valid numbers
            var cmd = construct_sql(url);
			console.log(cmd);
            // Execute query
            db.all(cmd, dataCallback);

        }
        else {
            response.writeHead(400, {"Content-Type": "text/plain"});
            response.write("Bad Request\n");
            response.end();
        }
    }

    //Closure
    function dataCallback(err,data) {
		// console.log(data);
		var res = {};
		res.results = {};
        //Error Check
        if (err) {
            console.log(err);
        }
		res.results = data;
		//console.log(JSON.stringify(res));
        // console.log(data);

        //Add message property to JSON
        if (data.length == 0 || data == undefined) {
            //res.push({"message":"These were no photos satisfying this query."});
			res.message = "These were no photos satisfying this query.";
			//response.writeHead(204, {"Content-Type": "text/plain"});
        } else {
            //res.push({"message":"These are all of the photos satisfying this query."});
			res.message = "These are all of the photos satisfying this query.";
        }





        //Write response
		response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(res));
        response.end();


    }

    //Closure
    function findFile() {
        fileServer.serve(request, response,function (err, result) {
            if (err) { // There was an error serving the file
                fileServer.serveFile('not-found.html', 404, {}, request, response);
            }
        });
    }
}



function update_tag(idNum, tag, type) {
	var get_tags_sql = `SELECT tags, landmark from photoTags where idNum = ${idNum}`

	db.all(get_tags_sql, dataCallback);

	function dataCallback(err,data) {
		if (type == 'delete') {
			if (data[0].tags) {
				var tags = data[0].tags;
				tags = tags.split(",");
				tag = String(decodeURIComponent(tag));
				var k = tags.indexOf(`${tag}`);

				if (k != -1) {
					tags.splice(k,1);
				}

				tags = tags.join(',');

				tags = String(tags);
				var update_db = `UPDATE photoTags SET tags="${tags}" where idNum = ${idNum}`;
			}

			if (data[0].landmark) {
				landmark = data[0].landmark;
				landmark = String(decodeURIComponent(landmark));
				var update_db = `UPDATE photoTags SET landmark="" where idNum = ${idNum}`;
			}
		}

		if (type == 'add') {
			var tags = String(decodeURIComponent(data[0].tags));
			var tags_split = tags.split(",");
			var flag_add = 0;
			for (var i = 0; i < tags_split.length; i++) {
				if (tags_split[i] == tag) {
					flag_add = 1;
					console.log('already exists');
				}
			}

			if (flag_add == 0) {
				tags = tags + "," + tag
			}
			var update_db = `UPDATE photoTags SET tags="${tags}" where idNum = ${idNum}`;

		}


		db.all(update_db, dataCallback2);
		function dataCallback2(err){
			if (err) {
				console.log(err);
			}
			console.log("tags after operation:");
			console.log(tags);
		}
	}
}




function validate_numbers(url) {
    //If we get a list
    if (url.constructor === Array) {

        //Loop through ARRAY
        for (var i = 0; i < url.length; i++) {

            //Run handle number on each element of array
            //Handle number returns -1 on error or a valid #
            if (handle_number(url[i]) == -1)
            {
                return -1;
            }
        }
        //means we got all valid numbers!
        return 0;
    }
    else {
        //Just 1 number requested
        //Invalid
        if (handle_number(url) == -1) {
            return -1;
        } else {
            return 0;
        }
    }
}





//Ensures correct query format
function handle_url(url)
{
    var input = url.split("/")[1];
    var rhs = url.split('query?keyList=')[1];

    //contains valid query
    if (input.startsWith('query?keyList=') == true) {
        if (rhs.includes('+')) {
            var splinput = rhs.split('+');
            return splinput;
        }
        else {
            return rhs;
        }
    }
    //Doesn't contain valid query
    else {
        return -1;
    }
}


// Logic:
//     can it be converted to a number
//     if  it is an integer between 0 and 989
//         send back the name of the photo with that index
//     else send back an error message

//  Number(): A Number. Returns different object values to their numbers.
//  If the value cannot be converted to a legal number, NaN is returned.
//  If no argument is provided, it returns 0.

function handle_number(num)
{
    var convert_to_num = Number(num);

    if (convert_to_num == NaN || convert_to_num < 0 || convert_to_num > 988 || num == '' || Number.isInteger(convert_to_num) == false) {
        return -1;
    } else {
        return convert_to_num;
    }
}


//Creates server
var finder = http.createServer(sendFiles);

//Listen to Port
finder.listen("52513");
