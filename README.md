Publish-Subscribe Social Platform
A simple publish-subscribe social platform built with Flask and raw TCP sockets. Users can register as publishers or viewers, publish posts with images and hashtag tagging, subscribe to publishers, and search posts by keyword or tag.
---
Architecture
The application is split into two processes that communicate over a local TCP socket.
`Main.py` is the Flask web server running on port 5000. It handles all HTTP requests from the browser and forwards them to the backend server by opening a TCP connection, sending a JSON message, and returning the response.
`Server.py` is the backend logic server running on port 9000. It listens for TCP connections, processes each message in a separate thread, reads and writes `data.json` for persistence, and sends a JSON response back.
```
Browser  <-->  Flask (port 5000)  <-->  TCP socket  <-->  Backend (port 9000)  <-->  data.json
```
---
Project Structure
```
project/
├── Main.py              Flask web server and route definitions
├── Server.py            Backend logic server
├── data.json            Persistent storage for users, posts, subscriptions, queues
├── static/
│   └── uploads/         Uploaded post images
└── templates/
    └── index.html       Frontend single-page application
```
---
Requirements
Python 3.8 or higher
Flask
Werkzeug (installed with Flask)
Install dependencies:

pip install flask

 
Running the Application
Both processes must be started. Open two separate terminals.

Terminal 1 — start the backend server:
python Server.py
Terminal 2 — start the Flask web server:
python Main.py
Then open `http://localhost:5000` in your browser.
	

User Roles
There are two roles available at registration.
publisher — can publish posts and be subscribed to by other users.
viewer — can browse, search, and subscribe to publishers, but cannot publish posts.


Features
Authentication
Register with a username, password, and role (publisher or viewer).
Login returns the user's role so the frontend can show or hide the publish form.
Logout clears the session.
Publishing
Publishers can submit a post with an optional title, body text, and image upload. Hashtags in the post body (e.g. `#nature`) are automatically extracted and stored as tags. Uploaded images are saved to `static/uploads/` and served statically.

Subscriptions
A viewer or publisher can subscribe to any publisher. When a publisher posts, the new post is pushed into each subscriber's personal queue in `data.json`. Unsubscribing removes the user from the publisher's subscriber list.

Feeds
Main feed (`/getPosts`) — returns the user's personal queue of posts from publishers they follow. If the queue is empty, returns the 10 most recent posts globally.
Subscription feed (`/getSubFeed`) — returns the 10 most recent posts from followed publishers only, regardless of the queue.

Search
Posts can be searched by keyword or hashtag across all posts or filtered to followed publishers only.
A search term beginning with `#` matches against stored tags (exact, case-insensitive).
Any other term matches against the post body, title, author username, and timestamp.

API Endpoints
All endpoints accept and return JSON except `/upload`, which accepts `multipart/form-data`.
Method	Path	Description
POST	`/login`	Authenticate a user
POST	`/register`	Create a new account
POST	`/upload`	Publish a new post with optional image
POST	`/subscribe`	Subscribe to a publisher
POST	`/unsubscribe`	Unsubscribe from a publisher
POST	`/getSubs`	Get list of publishers the user follows
POST	`/getPosts`	Get the user's post feed
POST	`/getSubFeed`	Get posts from followed publishers only
POST	`/search`	Search posts by keyword or hashtag
GET	`/logout`	Clear the session
GET	`/`	Serve the frontend
Request and response examples
Login
```json
// POST /login
{ "username": "alice", "password": "secret" }

// Response
{ "status": "ok", "role": "publisher" }
```
Publish
```
// POST /upload  (multipart/form-data)
username=alice
title=My Post
post=Hello world #greetings
image=<file>

// Response
{ "status": "success", "message": "Post published successfully" }
```
Subscribe
```json
// POST /subscribe
{ "username": "alice", "publisher": "bob" }

// Response
{ "status": "success", "message": "Subscribed successfully to bob" }
```
Search
```json
// POST /search
{ "keyword": "#greetings", "following": \["bob", "carol"] }

// Response
{ "status": "success", "feed": \[ ... ] }
```
---
Data Storage
All data is stored in `data.json` in the project root. The file is read into memory when the server starts and written after every change.
```json
{
  "users": {
    "alice": { "password": "secret", "role": "publisher" }
  },
  "subscriptions": {
    "alice": \["viewer1", "viewer2"]
  },
  "queues": {
    "viewer1": \[ { ...post }, { ...post } ]
  },
  "all\_posts": \[
    {
      "from": "alice",
      "title": "My Post",
      "post": "Hello world #greetings",
      "image": "/static/uploads/photo.png",
      "tags": \["#greetings"],
      "timestamp": "05/14/2026 10:30"
    }
  ]
}
```
---
