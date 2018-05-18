// Global; will be replaced by a call to the server!
var photoURLArray =
[
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Uluru%20sunset1141.jpg" },
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Sejong tomb 1.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Serra%20da%20Capivara%20-%20Painting%207.JPG"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Red%20pencil%20urchin%20-%20Papahnaumokukea.jpg"}
 ];


// Called when the user pushes the "submit" button
function photoByNumber() {

	var num = document.getElementById("num").value;
	num = num.trim();
    var get_input = handle_url(num);
    var retval = validate_numbers(get_input);

    //All valid inputs
    if (retval == 0) {
        get_input = "query?numList="+get_input.join('+');
    }
    else {
        get_input = "query?numList="+'';
    }


    var oReq = new XMLHttpRequest();
    oReq.open("GET", get_input);
    oReq.addEventListener("load", respCallback);
    oReq.send();

    function respCallback() {
        var photoName = oReq.responseText;
        var urlStart = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
        var display = document.getElementById("photoImg");

        //Part 4
        console.log(photoName);

        if (oReq.status == 400) {
            document.getElementById("num").value = '';
            document.getElementById("num").placeholder='Try Again';
        }

        if (oReq.status == 404) {
            console.log('404');
        }
    }
}

function handle_number(num)
{
    var convert_to_num = Number(num);

    if (convert_to_num == NaN || convert_to_num < 0 || convert_to_num > 988 || num == '' || Number.isInteger(convert_to_num) == false) {
        return -1;
    } else {
        return convert_to_num;
    }
}

function validate_numbers(url) {

    for (var i = 0; i < url.length; i++) {

            //Run handle number on each element of array
            //Handle number returns -1 on error or a valid #
            if (handle_number(url[i].trim()) == -1)
            {
                return -1;
            }
        }
        //means we got all valid numbers!
        return 0;
    }


function handle_url(url)
{
    if (url.includes(',')) {
        var splinput = url.split(',');
        return splinput;
    }
    else {
        var array = new Array(url);
        return array;
    }
}
