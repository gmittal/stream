import base64, os, requests, shutil, uuid
from os.path import join, dirname
from dotenv import load_dotenv
from flask import Flask

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)

@app.route("/incoming")
def hello():

    return "Hello World!"

# Returns a 30 second preview URL given a song name
def search(query):
    try:
        trackID = requests.get('https://api.spotify.com/v1/search?q='+query+'&type=track', headers={
            'Authorization': 'Bearer '+os.environ.get('SPOTIFY_ACCESS'),
        }).json()["tracks"]["items"][0]["id"]
    except IndexError:
        return None

    return requests.get('https://api.spotify.com/v1/tracks/'+trackID, headers={
        'Authorization': 'Bearer '+os.environ.get('SPOTIFY_ACCESS'),
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
    return file_id

def get_base64(path):
    with open(join(dirname(__file__), 'tmp/'+path)) as f:
        encoded = base64.b64encode(f.read())
        return encoded

print len(get_base64(download_song(search('strasbourg'))+'.mp3'))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000)
