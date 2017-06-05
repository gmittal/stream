import base64, imageio, math, numpy, os, qrcode, requests, shutil, sys, uuid
from os.path import join, dirname
from dotenv import load_dotenv
from flask import Flask, request, redirect, send_from_directory
from twilio.rest import Client
from pydub import AudioSegment

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__, static_url_path='')
client = Client(os.environ.get('TWILIO_SID'), os.environ.get('TWILIO_AUTH'))
HOSTNAME = os.environ.get('HOST')
PORT = os.environ.get('PORT')
BASE_URL = os.environ.get('BASE_URL')
QR_CAPACITY = 900.
SAMPLE_LENGTH = 5 * 1000

@app.route("/incoming", methods=['GET', 'POST'])
def incoming():
    """Respond to incoming song queries with a data GIF"""
    f_id = download_song(search(request.form.get('Body')))
    generate_gif(get_base64(f_id +'.mp3'), f_id)
    delete_asset(f_id +'.mp3')

    client.messages.create(
        to=request.form.get('From'),
        from_=os.environ.get('TWILIO_NUMBER'),
        body='',
        media_url='http://'+ BASE_URL +'/content/'+ f_id + '.gif')

    return "Complete"

# Serve static assets
@app.route('/content/<path:path>', methods=['GET'])
def serve_file(path):
    return send_from_directory('tmp', path)

# Returns a 30 second MP3 preview URL given a song name
def search(query):
    try:
        trackID = requests.get('https://api.spotify.com/v1/search?q='+ query +'&type=track', headers={
            'Authorization': 'Bearer '+ os.environ.get('SPOTIFY_ACCESS'),
        }).json()["tracks"]["items"][0]["id"]
    except IndexError:
        return None

    return requests.get('https://api.spotify.com/v1/tracks/'+ trackID, headers={
        'Authorization': 'Bearer '+ os.environ.get('SPOTIFY_ACCESS'),
    }).json()["preview_url"]

# Download MP3 given URL
def download_song(url):
    if not os.path.exists(join(dirname(__file__), 'tmp')):
        os.makedirs(join(dirname(__file__), 'tmp'))

    file_id = str(uuid.uuid4())
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(join(dirname(__file__), 'tmp/'+ file_id +'.mp3'), 'wb') as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)

        # Clip track to first SAMPLE_LENGTH seconds of audio
        song = AudioSegment.from_mp3(join(dirname(__file__), 'tmp/'+ file_id +'.mp3'))
        song[:SAMPLE_LENGTH].export(join(dirname(__file__), 'tmp/'+ file_id +'.mp3'), format='mp3')
    return file_id

# Delete local assets
def delete_asset(path):
    os.remove(join(dirname(__file__), 'tmp/'+ path))

# Get base64 encoding of a file
def get_base64(path):
    with open(join(dirname(__file__), 'tmp/'+ path)) as f:
        encoded = base64.b64encode(f.read())
        return encoded

# Generate GIF of QR codes
def generate_gif(data, uid):
    images = []
    for i in range(int(math.ceil(len(data)/QR_CAPACITY))):
        raw = data[int(i*QR_CAPACITY):int((i+1)*QR_CAPACITY)]
        encoded = raw.ljust(int(QR_CAPACITY))

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=2,
            border=1,
        )
        qr.add_data(encoded)
        qr.make(fit=True)
        img = (qr.make_image()).get_image()
        images.append(numpy.array(img))

    kargs = {'duration': 0.1}
    imageio.mimsave(join(dirname(__file__), 'tmp/'+ uid +'.gif'), images, 'GIF', **kargs)

if __name__ == "__main__":
    app.run(host=HOSTNAME, port=PORT)
