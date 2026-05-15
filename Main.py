from flask import Flask, request, session, jsonify, render_template
import socket
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'test123'

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def toServer(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('localhost', 9000))
    s.send(json.dumps(data).encode())
    response = s.recv(4096).decode()
    s.close()
    return json.loads(response)

#-----------------------------Login------------------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    response = toServer({'type': 'login', 'username': data['username'], 'password': data['password']})
    return jsonify(response)

#-----------------------------Register----------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    response = toServer({'type': 'register', 'username': data['username'], 'password': data['password'], 'role': data['role']})
    return jsonify(response)

#-----------------------------Publish + Upload-----------------------------
@app.route('/upload', methods=['POST'])
def upload():
    image = request.files.get('image')
    post_text = request.form.get('post')
    post_title = request.form.get('title', '')
    username = request.form.get('username')

    image_path = None
    if image and image.filename != '':
        filename = secure_filename(image.filename)
        image.save(os.path.join(UPLOAD_FOLDER, filename))
        image_path = f'/static/uploads/{filename}'

    response = toServer({
        'type': 'publish',
        'username': username,
        'title': post_title,
        'post': post_text,
        'image': image_path
    })
    return jsonify(response)

#-----------------------------Subscribe-----------------------------
@app.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    response = toServer({'type': 'subscribe', 'subscriber': data['username'], 'publisher': data['publisher']})
    return jsonify(response)

#-----------------------------Unsubscribe-----------------------------
@app.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    data = request.get_json()
    response = toServer({'type': 'unsubscribe', 'subscriber': data['username'], 'publisher': data['publisher']})
    return jsonify(response)

#-----------------------------Get Subscriptions-----------------------------
@app.route('/getSubs', methods=['POST'])
def getSubscriptions():
    data = request.get_json()
    response = toServer({'type': 'get_subscriptions', 'username': data['username']})
    return jsonify(response)

#-----------------------------Posts--------------------------------
@app.route('/getPosts', methods=['POST'])
def getPosts():
    data = request.get_json()
    response = toServer({'type': 'get_posts', 'username': data['username']})
    return jsonify(response)

#-----------------------------Sub Feed-----------------------------
@app.route('/getSubFeed', methods=['POST'])
def getSubFeed():
    data = request.get_json()
    response = toServer({'type': 'get_sub_feed', 'username': data['username']})
    return jsonify(response)

#-----------------------------Search-----------------------------
@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    response = toServer({
        'type': 'search_posts',
        'keyword': data['keyword'],
        'following': data.get('following', None)
    })
    return jsonify(response)

#-----------------------------Logout-------------------------------
@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out!'})

#-----------------------------Main--------------------------------
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)