from flask import Flask, request, redirect
app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
def hello():
	myvar =  request.form["b64"]
	# print myvar
	yo = myvar.rstrip()
	return yo

if __name__ == "__main__":
    app.run()