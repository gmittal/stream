Stream videos offline (crazy, right!?)
=======
Videos over MMS??! What sorcery is this?


Stream is a simple Node.js-based backend that allows you to send any YouTube search query, and receive the video's base64 content as a GIF with its frames being a set of QR codes. These QR codes contain 1400 character chunks of the video's entire base64 string. This allows you to do interesting things with this API, such as make a call to the server from Twilio, and receive the video's contents as an MMS. This allows you to, in theory, retrieve video files without a need for an internet connection (because the video data can be sent over an MMS connection). 

To use this API, you can make a post request to [http://www.gautam.cc:3000/incoming](http://www.gautam.cc:3000/incoming) with the following parameters:
* **Body (required)**: This is the YouTube search query that you will send to the server.
* **From (required)**: This is the phone number that you would like the server to send the GIF of QR codes to.

The server will respond with the URL that the GIF will be available at once it is finished generating. Because the GIF is not generated instantly, the server also returns the ETA in seconds. The phone number is required, as this server has been optimized to run as a Twilio server, but you do not need to enter a valid phone number to use the API (which allows you to use this API has a stand-alone service on the web). 


Writing a frontend for this server should be fairly straightforward. Once your app receives the GIF from the server (either by making a POST request or by receiving an MMS), you can split the GIF into individual frames, parse the individual QR code frames, and then stitch the individual 1400 character chunks back together. Once you have competed the process, you can decode the base64 content to display your video. There is no frontend yet, but feel free to write your own, or modify/contribute to this code to fit your own frontend needs. If you have any questions please direct them to [gautam-AT-mittal-DOT-net](mailto:gautam@mittal.net).

_**Note**: It is highly recommended that you download and build the code yourself before testing it out. Feel free to try out the API links I have given, but use at your own risk, as the public API is not meant to be used for production or even high-level development purposes._
