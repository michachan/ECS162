//Require statements at the top
var http = require('http');
var static = require('node-static');
var fileServer = new static.Server('./public');
var fs = require('fs');  // file access module
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);


var sqlTag = "SELECT * FROM photoTags WHERE idNum IN (";
var sqlUpdate = "UPDATE photoTags SET tags = ? WHERE idNum = ?";

// Logic:
//     If the link contains the word query DONE
//         dynamically answer like miniserver.js DONE
//     else its a static request DONE
//         handle the static request DONE
//         if its a page you dont have DONE
//             respond with a 404 page DONE

function handleDeleteTag(q)
{
    var idAndTag = q.split("=");
    var removeIdNum = idAndTag[1].split("+");
    var sqlCmd = sqlTag + removeIdNum[0] + ')';
    console.log(sqlCmd);
    db.each(sqlCmd, hollaback);

    function hollaback(error, data){
        if(error) console.log(error);
        var split = data.tags.split(",");
        split.splice(split.indexOf(removeIdNum[1]), 1);
        split = split.join(",");
        db.run(sqlUpdate, split, removeIdNum[0]);
    }
}

function sendFiles (request, response) {
    var url = request.url;
    var q = url.split("/")[1];
    console.log(request.url);
    if(q.indexOf('delTag')>=0)
        handleDeleteTag(q);

    // Error checking
    else if (q.startsWith('query?keyList=') == false && q.includes('query') == false) {
        request.addListener('end', findFile).resume();
    }
    else {

        // if valid number of list of valid numbers
        // this function should return 0, else -1
        url = String(handle_url(url));
        url = decodeURIComponent(url);


        //TODO need a better check here BUG
        if (url) {

            //Construct sql based off valid numbers
            var cmd = construct_sql(url);

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

        //Error Check
        if (err) {
            console.log(err);
        }

        // console.log(data);

        //Add message property to JSON
        if (data.length == 0 || data == undefined) {
            data.push({"message":"These were no photos satisfying this query."});
            data.push({TagList: data.tags.split(",")});
        } else {
            data.push({"message":"These are all of the photos satisfying this query."});
        }

        //Write response
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(data));
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



function construct_sql(cmd) {
    var split_cmd = String(cmd).split(",");
    var sql = `SELECT * FROM photoTags WHERE `

    for (var i=0; i < split_cmd.length; i++) {
        var each_split = `(landmark = "${split_cmd[i]}" OR tags LIKE "%${split_cmd[i]}%") `;
        if (i == split_cmd.length - 1) {
            sql = sql + each_split;
        } else {
            sql = sql + each_split + "AND ";
        }
    }

    console.log(sql);
    return sql;
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
finder.listen("56965");
