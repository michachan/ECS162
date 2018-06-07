/*const photos = [
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg", width: 574, height: 381 },
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Uluru%20sunset1141.jpg", width: 500 , height: 334 },
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Sejong tomb 1.jpg", width: 574, height: 430},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Serra%20da%20Capivara%20-%20Painting%207.JPG", width: 574, height: 430},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg", width: 574, height: 410},
{src: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Red%20pencil%20urchin%20-%20Papahnaumokukea.jpg", width: 574 , height: 382 }
];*/

// Called when the user pushes the "submit" button
function photoByNumber() {
	if(document.getElementById('num').style.display === 'none'){
		var pageName = document.getElementsByTagName('header')[0].getElementsByTagName('h1')[0];
		pageName.style.display = 'none';
		var searchBar = document.getElementById('num');
		searchBar.style.display = '';
		document.getElementById('sbut').src = '/search2.png';
	} else {
		if(document.documentElement.clientWidth < 650){
			var pageName = document.getElementsByTagName('header')[0].getElementsByTagName('h1')[0];
			pageName.style.display = '';
			var searchBar = document.getElementById('num');
			searchBar.style.display = 'none';
			document.getElementById('sbut').src = '/search.png';
		}
		var num = document.getElementById("num").value;
		num = num.trim();
		var get_input = handle_url(num);
		// var retval = validate_numbers(get_input);

		//All valid inputs
		if (get_input) {
			get_input = "query?keyList="+get_input.join('+');
		}
		else {
			get_input = "query?keyList="+'';
		}

		var oReq = new XMLHttpRequest();
		oReq.open("GET", get_input);
		oReq.addEventListener("load", respCallback);
		oReq.send();

		function respCallback() {
			if (oReq.status !== 200) {
				document.getElementById("num").value = '';
				document.getElementById("num").placeholder='Try Again';
			} else {
				var photoName = oReq.responseText;
				var urlStart = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
				var parsedRes = JSON.parse(photoName);
				for(var i=0;i<parsedRes.length;i++){
					parsedRes[i].src = urlStart + parsedRes[i].src;
					if(parsedRes[i].tags){
						parsedRes[i].tags = parsedRes[i].tags.split(",");
					}
				}
				var display = document.getElementById("photoImg");

				//Part 4
				console.log(parsedRes);
				var setColumn;
				if(document.documentElement.clientWidth > 650){
					setColumn = 2;
				} else {
					setColumn = 1;
				}
				renderReact(parsedRes,setColumn);
			}
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
    if (url.includes(' ')) {
        var splinput = url.split(' ');
        return splinput;
    }
    else {
        var array = new Array(url);
        return array;
    }
}


function updateDBTags(idNumber, tag){		//id Number is the number of the picture in the database, index is the tag that u want to delete
	var xhr = new XMLHttpRequest();
    var reqQuery = idNumber +","+tag;
    console.log(reqQuery);
    xhr.open("GET", "/query?delTag=" + encodeURI(reqQuery).replace(/ |,/g, "+"));
    xhr.send();
}

// TA CODE
function renderReact(photos,columns){
	// A react component for a tag
	class Tag extends React.Component {

		render () {
		return React.createElement('p',  // type
			{ className: 'tagText'}, // properties
		   this.props.text);  // contents
		}
	};


	// A react component for controls on an image tile
	class TileControl extends React.Component {

        constructor(props){
            super(props);
            this.state = {tags: props.Tags}; // set the state of the Tile to be the list of tags it has
        }

        deleteTag(index, event){
			event.stopPropagation();
            var tag = this.state.tags.splice(index,1);    // get rid of the element in the index in the tags array
            this.setState({tags: this.state.tags }); // update the state
            updateDBTags(this.props.IdNum, tag);  //TODO: pass in index, pass in the photo number and send an AJAX request
        }

		render () {
		// remember input vars in closure
			var _selected = this.props.selected;
			var _src = this.props.src;
			// parse image src for photo name
            var _tags = this.props.Tags;
            var args = [];
            args.push( 'div' );
            args.push( { className: _selected ? 'selectedControls' : 'normalControls'} )
			try{
				for (var idx =0; idx < _tags.length; idx++)
	                args.push(
	                    React.createElement("div", {onClick: this.deleteTag.bind(this, idx)} ,
	                    React.createElement(Tag, {text: _tags[idx], parentImage: _src})
	                ));
			}
            catch(e){
				//console.log(e);
			}

            return (React.createElement.apply(null, args) );
		} // render
	};


	// A react component for an image tile
	class ImageTile extends React.Component {

		render() {
		// onClick function needs to remember these as a closure
		var _onClick = this.props.onClick;
		var _index = this.props.index;
		var _photo = this.props.photo;
		var _selected = _photo.selected; // this one is just for readability

		return (
			React.createElement('div',
				{style: {margin: this.props.margin, width: _photo.width},
				 className: 'tile',
							 onClick: function onClick(e) {
					console.log("tile onclick");
					// call Gallery's onclick
					return _onClick (e,
							 { index: _index, photo: _photo })
					}
			 }, // end of props of div
			 // contents of div - the Controls and an Image
			React.createElement(TileControl,
				{selected: _selected,
				 src: _photo.src,
				 IdNum: _photo.idNum,
                Tags: _photo.tags}),
			React.createElement('img',
				{className: _selected ? 'selected' : 'normal',
						 src: _photo.src,
				 	 	width: _photo.width,
						 height: _photo.height
					})
					)//createElement div
		); // return
		} // render
	} // class



	// The react component for the whole image gallery
	// Most of the code for this is in the included library
	class App extends React.Component {

	  constructor(props) {
		super(props);
		this.state = { photos: photos };
		this.selectTile = this.selectTile.bind(this);
	  }

	  selectTile(event, obj) {
		console.log("in onclick!", obj);
		let photos = this.state.photos;
		photos[obj.index].selected = !photos[obj.index].selected;
		this.setState({ photos: photos });
	  }

	  render() {
		return (
		   React.createElement( Gallery, {photos: photos,
			   onClick: this.selectTile,
			   ImageComponent: ImageTile,
			   columns: columns} )
			);
	  }

	}

	const reactContainer = document.getElementById("react");

	ReactDOM.render(React.createElement(App),reactContainer);
}
