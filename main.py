import base64, imageio, numpy, os, qrcode, requests, shutil, sys, uuid
from os.path import join, dirname
from dotenv import load_dotenv
from flask import Flask
from pydub import AudioSegment

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)

@app.route("/incoming")
def hello():
    return "Hello World!"

# Returns a 30 second preview URL given a song name
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

        # Clip track to first 5 seconds of audio
        song = AudioSegment.from_mp3(join(dirname(__file__), 'tmp/'+ file_id +'.mp3'))
        song[:5000].export(join(dirname(__file__), 'tmp/'+ file_id +'.mp3'), format='mp3')
    return file_id

def get_base64(path):
    with open(join(dirname(__file__), 'tmp/'+ path)) as f:
        encoded = base64.b64encode(f.read())
        return encoded

# def generate_qr(data):
#     pass
#
#
# images = []
# for i in range(0, 100):
#     qr = qrcode.QRCode(
#         version=1,
#         error_correction=qrcode.constants.ERROR_CORRECT_L,
#         box_size=1,
#         border=0,
#     )
#     qr.add_data("adsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdl;lfdkja sl;dfasdfasdfjsl;akdjf sl;kdfj asl;dkfj s;lkdfj a;lskdjf lasjdfsadfs;lfdkja sl;dfasdfasdfjsl;akdjf sl;kdfj asl;dkfj s;lkdfj a;lskdjf lasjdfsadfs;lfdkja sl;dfasdfasdfjsl;akdjf sl;kdfj asl;dkfj s;lkdfj a;lskdjf lasjdfsadfasdaasdfasdfasdfasdfadfasdfasdfadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsafajsdlfjasldfkjadsfsaaasdfasdfasdfasdfadsfasdfsadfasdfasdfasdfasdfas")
#     qr.make(fit=True)
#     img = (qr.make_image()).get_image()
#
#     images.append(numpy.array(img))
# kargs = {'duration': 0.1}
# imageio.mimsave('movies.gif', images, 'GIF', **kargs)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000)
