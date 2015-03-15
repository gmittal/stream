// keeps my credentials secret
var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var request = require('request');
// var fs = require('fs');
var fs = require('graceful-fs');
var async = require('async');
var Firebase = require('firebase');
var http = require('http');
var qr = require('qr-image');  
var easyimg = require('easyimage');
var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var fs = require('fs');
var pngFileStream = require('png-file-stream');


var client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

var encoder = new GIFEncoder(298, 298);
// stream the results as they are available into myanimated.gif
//encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));



var db = new Firebase('https://hgy-sms-jmjypwax.firebaseio.com/');

var app = express()
app.use(bodyParser());
app.use(express.static(__dirname + '/tmp'));

require('shelljs/global');

cd('tmp');

app.post('/incoming', function (req, res) {
    var uid_spec = db.push().key();

    console.log(req.body.From);

  searchYT(req.body.Body, function(url, time) {

        console.log(url);
        var file_name = extractParameters(url)["v"];
        
       // cd('tmp');
        var dl_command = 'youtube-dl -f mp4 -o '+ file_name.toString() +'.mp4 "'+ url +'"';
        console.log(dl_command);
        exec(dl_command);

        var rate_format = 1000000000/time;

        // exec('ffmpeg -i '+file_name+'.mp4 -b '+rate_format+' -y '+file_name+'.mp4');

			// convert image to base64 encoded string
			var base64str = base64_encode(file_name+".mp4");
		//	console.log(base64str);

                      console.log(base64str.length);

                       var seconds = Math.ceil(Math.ceil((base64str.length/1400))/3.66666);

      res.set('Content-Type', 'application/json');
                        res.send({'url':'http://www.gautam.cc:3000/'+uid_spec+'YAY.gif', 'eta':seconds});

			  generateQRs(base64str, req.body.From, uid_spec);

  });

 // res.send('http://www.gautam.cc:3000/'+uid_spec+'YAY.gif');
});


function searchYT(query, cb) {
  superagent
    .get('http://partysyncwith.me:3005/search/'+query+'/1')
    .end(function(err, res) {
      if(err) {
        console.log(err);
      } else {

        if (typeof JSON.parse(res.text).data !== 'undefined') {
          if (JSON.parse(res.text).data[0].duration < 10) {
            var url = JSON.parse(res.text).data[0].video_url;
            var time = JSON.parse(res.text).data[0].duration;
            // console.log(url);
            cb(url, time);
          } else {
            cb(null);
          }
        }
      }
    })
  }


function generateQRs(b64, phone_number, UID) {

        // grab start time
        var startProcessTime = new Date();

//	var UID = db.push().key();

	var strings = [];
	var index = 0;
	while (index < b64.length) {
	    var me_json = {};
	    me_json["body"] = b64.substring(index, Math.min(index + 1400,b64.length));

	    strings.push(me_json);
	    index += 1400;
	}


        // add iterator values to the json within the strings array
        for (var swap_i = 0; swap_i < strings.length; swap_i++) {
	    var tmp = strings[swap_i];
	    tmp["id"] = swap_i;
	    strings[swap_i] = tmp;
	}

  //      console.log(strings);

	console.log(strings.length+' QR codes need to be generated');


 /*   var code = qr.image(b64, { type: 'png' });
    var output = fs.createWriteStream('YOPI.png');
    code.pipe(output); */

//   for (var k = 0; k < strings.length; k++) {

//    var k = 0;
//    loopt();

    encoder.createReadStream().pipe(fs.createWriteStream(UID+"YAY.gif"));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    var canvas = new Canvas(298, 298);
    var ctx = canvas.getContext('2d');

  /*  var mygif = fs.createWriteStream(UID+'YAY.gif');
    var yo = pngFileStream('tmp/'+UID+'?.png').pipe(encoder.createWriteStream({ repeat: 0, delay: 100, quality: 10 })).pipe(mygif); */

    // CREATE THE IMAGES
   // var mtTasks = [];

 /*   for (var mtID = 0; mtID < strings.length; mtID++) {
	mtTasks.push(function yay(callback){ console.log(mtID); });
    } */

   // mtTasks[2].yay();


  //  async.eachSeries(strings, function(file, callback) {

	// Perform operation on file here.
	//console.log('Processing file ' + file);
//	console.log(strings[file.id]);


//	var code = qr.image(strings[file.id].body, { type: 'png', size:2 });
//	var output = fs.createWriteStream(UID+(file.id)+'.png');
//	code.pipe(output);
	
//	console.log('Generated IMG '+ file.id);

//	callback();
	
  //  }, function(err){
//	// if any of the file processing produced an error, err would equal that error
//	if( err ) {
//	    // One of the iterations produced an error.
//	    // All processing will now stop.
//	    console.log('A file failed to process');
//	} else {
//	    console.log('All files have been processed successfully');
//	}
  //  }); // end async.each

    

    console.log(UID);
    
    var k = 0;
    loopt();

    function loopt() {



		var code = qr.image(strings[k].body, { type: 'png', size:2 });
		var output = fs.createWriteStream(UID+k.toString()+'.png');

		code.pipe(output);

		code.on('end', function() {

		    
		    fs.readFile(__dirname + '/tmp/'+UID+k.toString()+'.png', function(err, squid){
			if (err) throw err;
			img = new Canvas.Image;
			//img.onload = function() {
			 //   console.log(k);

			img.onload = function() {
			    ctx.drawImage(img, 0, 0, img.width, img.height);
			    encoder.addFrame(ctx);
			};


			img.src = squid;
			//img.on('load', function () {
			   // ctx.drawImage(img, 0, 0, img.width, img.height);
			   // encoder.addFrame(ctx);
			//}); 

			//ctx.drawImage(img, 0, 0, img.width, img.height);
			//encoder.addFrame(ctx);

			//}

			//img.src = squid;
			
			//img.src = squid;
		        //ctx.drawImage(img, 0, 0, img.width, img.height);
			//encoder.addFrame(ctx);
			
			console.log(k);
			k++;


			if (k < strings.length) {
			    loopt();
			} else {
			    encoder.finish();
			   // var mygif = fs.createWriteStream(UID+'YAY.gif');
			   // var yo = pngFileStream(__dirname + '/tmp/'+UID+'?.png').pipe(encoder.createWriteStream({ repeat: 0, delay: 100, quality: 10 })).pipe(mygif);

			    var endProcessTime = new Date();
			    console.log("Finished downloading at "+ endProcessTime);
			    console.log("Operation took "+(endProcessTime.getTime() - startProcessTime.getTime())/1000+' seconds to complete.');

			    console.log(UID);
			    
			    client.messages.create({
				    body: "",
				    to: phone_number,
				    from: "+16503004931",
				    mediaUrl: "http://gautam.cc:3000/"+UID+"YAY.gif"
				}, function(err, message) {
				    console.log(err);
				        // process.stdout.write(message.sid);
				    });


			} 



		    }); // end fs readFile callback

		    
		}); // end pipe.on callback

    } 


/*    function buildCodes() {
	encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));
	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(100);  // frame delay in ms
	encoder.setQuality(10); // image quality. 10 is default.
	
	var canvas = new Canvas(745, 745);
	var ctx = canvas.getContext('2d');

	for (var x = 0; x < strings.length; x++) {
	    fs.readFileSync(__dirname+"/tmp/"+UID+x.toString()+'.png', function(err, squid){
		if (err) throw err;
		img = new Canvas.Image;
		img.src = squid;

		console.log(x);
		ctx.drawImage(img, 0, 0, img.width, img.height);
		encoder.addFrame(ctx);
	    });
	}

	encoder.finish();
	console.log("FINISHED GENERATING GIF");


    } */

 //   buildCodes(); //execute GIF generation
    

   // console.log("YO");

    
	    

	 



   // console.log("YAYYAYAYAYAYAY");

	// var k = 0;
	// while (k < strings.length) {
	// 	var file = fs.createWriteStream(UID+k.toString()+".png");
	// 	var request = http.get("http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl="+strings[k], function(response) {
	// 	  response.pipe(file);

	// 	  console.log(((k/strings.length)*100).toString() + '% downloaded'); 
	// 	  k++;

	// 	});

	// }
	


	// var qrUrls = [];

	// var k = 0;
	// var doneBool = false;

	// 		sync_req();

	// 		function sync_req() {


	// 			// console.log(strings[k].trim());
	// 			// console.log('https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+strings[k]);


	// 			var headers = {
	// 			    'Authorization':       'client-id 2d2c75a4eea2116',
	// 			    'Content-Type':     'application/x-www-form-urlencoded'
	// 			}

	// 			// Configure the request
	// 			var options = {
	// 			    url: 'https://api.imgur.com/3/image',
	// 			    method: 'POST',
	// 			    headers: headers,
	// 			    qs: {'image': 'https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+strings[k]}
	// 			}

	// 			// exec('open https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+strings[k])
	// 			// fs.writeFile("arghhhh.txt", strings[k], function(err) {});

	// 			request(options, function (error, response, body) {
	// 				    if (!error && response.statusCode == 200) {
	// 				        // Print out the response body
	// 				        // console.log(body)
	// 				        // console.log(JSON.parse(body).data.link);
	// 				        // console.log(options.qs.image);

	// 				        qrUrls.push(JSON.parse(body).data.link);
	// 				        console.log(qrUrls);
	// 				        console.log(qrUrls.length);

	// 				        if (k < strings.length - 1) {
	// 				        	k++;
	// 					        sync_req();	
	// 				        } else {
	// 				        	console.log("YOOO");


					        	

	// 				        	// console.log("yo");
	// 				        	// var gifArr = [];

	// 				        	var gifStr = "";


	// 				        	for (var j = 0; j < qrUrls.length; j++) {
	// 				        		if (j != qrUrls.length - 1) {
	// 				        			if (((j+1)%14) == 0) {
	// 				        				gifStr += qrUrls[j] +",|";
	// 				        			} else {
	// 				        				gifStr += qrUrls[j] +",";
	// 				        			}
					        			
	// 				        		} else {
	// 				        			gifStr += qrUrls[j];
	// 				        		}
					        		

	// 				        	}

	// 				        	// console.log(gifStr);
	// 				        	var gifArr = gifStr.split("|");
	// 				        	console.log(gifArr);

	// 				        	var twilioArr = [];

	// 				        	sync_twilio();

	// 				        	var l = 0;

	// 				        	function sync_twilio() {
	// 				        	// for (var l = 0; l < gifArr.length; l++) {
	// 				        		console.log(gifArr)
	// 				        		var urlData = gifArr[l];

	// 				        		if (urlData.substring(urlData.length-1, urlData.length) === ',') {
	// 				        			urlData = urlData.substring(0, urlData.length-1);
	// 				        		}

	// 				        		request('http://ibacor.com/api/gif-maker?img='+urlData+'&w=400&h=400&f=100&k=b6274b347c0935f21914ea7a3e32f4f2', function (err, message, body) {
	// 				        			var image =	JSON.parse(body).img;

	// 				        			var headers = {
	// 									    'Authorization':       'client-id 2d2c75a4eea2116',
	// 									    'Content-Type':     'application/x-www-form-urlencoded'
	// 									}

	// 									// Configure the request
	// 									var options = {
	// 									    url: 'https://api.imgur.com/3/image',
	// 									    method: 'POST',
	// 									    headers: headers,
	// 									    qs: {'image': image}
	// 									}

	// 									// exec('open https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+strings[k])
	// 									// fs.writeFile("arghhhh.txt", strings[k], function(err) {});

	// 									request(options, function (error, response, imgD) {
	// 										    if (!error && response.statusCode == 200) {
	// 										        // Print out the response body
	// 										        // console.log(body)
	// 										        // console.log(JSON.parse(body).data.link);
	// 										        // console.log(options.qs.image);

	// 										        // qrUrls.push(JSON.parse(imgD).data.link);
	// 										        // console.log(qrUrls);
	// 										        // console.log(qrUrls.length);
	// 										        console.log(JSON.parse(imgD).data.link);

	// 										        if (l < gifArr.length) {
	// 										        	l++;
	// 										        	sync_twilio();
	// 										        }
											        

	// 										    }
	// 										});


	// 				        		}); // end request ibacor API
					        		 

	// 				        	} // end for loop, uh oh

	// 				        	// console.log("YOOOOOO");
	// 				        }
					        
	// 				    } else {
	// 				    	console.log(error);
	// 				    	console.log(response.statusCode);
	// 				    }
	// 			});


	// 		}

	

	// console.log("+====================================================== YOoooooo");


	

	// console.log(qrUrls);


	

	// https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=askdjalsdkjalskd
	// fs.writeFile(file_name+"arghhhh.jpg", new Buffer(request.body.photo, "base64"), function(err) {});

	// http://ibacor.com/api/gif-maker?img=http://www.sexyli.com/wp-content/uploads/2013/05/Green-Snake-Image-Wallpaper.jpg,http://www.esa.int/var/esa/storage/images/esa_multimedia/images/2014/02/gaia_calibration_image/14263603-2-eng-GB/Gaia_calibration_image.jpg&w=400&h=400&f=100&k=b6274b347c0935f21914ea7a3e32f4f2

}


function extractParameters(url)
{
  var query = url.match(/.*\?(.*)/)[1];
  var assignments = query.split("&");
  var pair, parameters = {};
  for (var ii = 0; ii < assignments.length; ii++)
  { 
      pair = assignments[ii].split("=");
      parameters[pair[0]] = pair[1];
  }
  return parameters;
}


String.prototype.trim = function() {  
   return this.replace(/^\s+|\s+$/g,"");  
}  


function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}



var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});


