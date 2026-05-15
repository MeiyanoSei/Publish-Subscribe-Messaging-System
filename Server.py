import socket
import threading
import json
import os
import re
from datetime import datetime

users = {}
queues = {}
subscriptions = {}
all_posts = []

SAVE_FILE = 'data.json'

def save_data():
    with open(SAVE_FILE, 'w') as f:
        json.dump({
            'users': users,
            'queues': queues,
            'subscriptions': subscriptions,
            'all_posts': all_posts
        }, f)

def load_data():
    global users, queues, subscriptions, all_posts
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r') as f:
            data = json.load(f)
            users = data.get('users', {})
            queues = data.get('queues', {})
            subscriptions = data.get('subscriptions', {})
            all_posts = data.get('all_posts', [])

def handle_client(conn):
    data = conn.recv(4096).decode()
    message = json.loads(data)

#-----------------------------REGISTER AND LOGIN-----------------------------
    if message['type'] == 'register':
        username = message['username']
        password = message['password']
        role = message['role']

        if username in users:
            conn.send(json.dumps({'status': 'error', 'message': 'Username already exists!'}).encode())
        else:
            users[username] = {'password': password, 'role': role}
            save_data()
            conn.send(json.dumps({'status': 'success', 'message': 'Registration Successful!'}).encode())

    elif message['type'] == 'login':
        username = message['username']
        password = message['password']

        if username not in users:
            conn.send(json.dumps({'status': 'error', 'message': 'Login Error!'}).encode())
        elif users[username]['password'] != password:
            conn.send(json.dumps({'status': 'error', 'message': 'Login Error!'}).encode())
        else:
            role = users[username]['role']
            conn.send(json.dumps({'status': 'ok', 'role': role}).encode())

#-----------------------------PUBLISH-----------------------------
    elif message['type'] == 'publish':
        username = message['username']

        if users[username]['role'] != 'publisher':
            conn.send(json.dumps({'status': 'error', 'message': 'Permission Denied!'}).encode())
        else:
            title = message.get('title', '')
            post = message['post']
            image = message.get('image', None)
            tags = re.findall(r'#\w+', post)
            timestamp = datetime.now().strftime('%m/%d/%Y %H:%M')

            post_data = {
                'from': username,
                'title': title,
                'post': post,
                'image': image,
                'tags': tags,
                'timestamp': timestamp
            }
            all_posts.append(post_data)

            followers = subscriptions.get(username, [])
            for follower in followers:
                if follower not in queues:
                    queues[follower] = []
                queues[follower].append(post_data)

            save_data()
            conn.send(json.dumps({'status': 'success', 'message': 'Post published successfully'}).encode())

#-----------------------------SUBSCRIBE-----------------------------
    elif message['type'] == 'subscribe':
        subscriber = message['subscriber']
        publisher = message['publisher']

        if publisher not in users or users[publisher]['role'] != 'publisher':
            conn.send(json.dumps({'status': 'error', 'message': 'User not found!'}).encode())
        else:
            if publisher not in subscriptions:
                subscriptions[publisher] = []
            if subscriber not in subscriptions[publisher]:
                subscriptions[publisher].append(subscriber)
            save_data()
            conn.send(json.dumps({'status': 'success', 'message': f'Subscribed successfully to {publisher}'}).encode())

#-----------------------------UNSUBSCRIBE-----------------------------
    elif message['type'] == 'unsubscribe':
        subscriber = message['subscriber']
        publisher = message['publisher']

        if publisher not in users or users[publisher]['role'] != 'publisher':
            conn.send(json.dumps({'status': 'error', 'message': 'User not found!'}).encode())
        else:
            if publisher in subscriptions and subscriber in subscriptions[publisher]:
                subscriptions[publisher].remove(subscriber)
                save_data()
                conn.send(json.dumps({'status': 'success', 'message': f'Unsubscribed successfully from {publisher}'}).encode())
            else:
                conn.send(json.dumps({'status': 'error', 'message': f'Not subscribed to {publisher}'}).encode())

#-----------------------------GET SUBSCRIPTIONS-----------------------------
    elif message['type'] == 'get_subscriptions':
        username = message['username']
        user_subscriptions = [pub for pub, subs in subscriptions.items() if username in subs]
        conn.send(json.dumps({'status': 'success', 'subscriptions': user_subscriptions}).encode())

#-----------------------------SUBSCRIPTION FEED-----------------------------
    elif message['type'] == 'get_sub_feed':
        username = message['username']
        following = [pub for pub, subs in subscriptions.items() if username in subs]
        feed = [p for p in all_posts if p['from'] in following][-10:]
        conn.send(json.dumps({'status': 'success', 'feed': feed}).encode())

#-----------------------------POSTS-----------------------------
    elif message['type'] == 'get_posts':
        username = message['username']
        feed = queues.get(username, [])

        if not feed:
            feed = all_posts[-10:]

        save_data()
        conn.send(json.dumps({'status': 'success', 'feed': feed}).encode())

#-----------------------------SEARCH-----------------------------
    elif message['type'] == 'search_posts':
        keyword = message['keyword'].lower()
        following = message.get('following', None)  # list of followed users or None
        is_tag = keyword.startswith('#')

        if is_tag:
            results = [p for p in all_posts if
                keyword in [t.lower() for t in p.get('tags', [])] and
                (following is None or p['from'] in following)
            ]
        else:
            results = [p for p in all_posts if
                (keyword in p['post'].lower() or
                keyword in p['from'].lower() or
                keyword in p.get('timestamp', '').lower() or
                keyword in p.get('title', '').lower()) and
                (following is None or p['from'] in following)
            ]

        conn.send(json.dumps({'status': 'success', 'feed': results}).encode())

    else:
        conn.send(json.dumps({'status': 'error', 'message': 'Unknown message type'}).encode())

    conn.close()

#-----------------------------MAIN------------------------------
load_data()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 9000))
server.listen()
print("Server is running on port 9000...")

while True:
    conn, addr = server.accept()
    thread = threading.Thread(target=handle_client, args=(conn,))
    thread.start()