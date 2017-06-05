Kawa
=======
An offline mobile music streaming service.

## Installation
Clone the repo, and find your local copy.
```
git clone https://github.com/gmittal/stream && cd stream
```

Install the dependencies.
```
pip install -r requirements.txt
```

## Usage
Start an [ngrok](https://ngrok.com/) tunnel on the ```PORT``` of your choice.
```
ngrok http XXXX
```

Populate a ```.env``` in the project root with following information.
```
HOST=0.0.0.0
BASE_URL=XXXXXXXX.ngrok.io
PORT=XXXX
SPOTIFY_ACCESS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_SID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_NUMBER=+1xxxxxxxxxx
```

In your [Twilio phone number settings](https://www.twilio.com/console/phone-numbers/incoming), set your number's messaging web hook to the server endpoint.
![](https://puu.sh/wbTCy/c34e371de1.png)

Run the Flask server.
```
python main.py
```
