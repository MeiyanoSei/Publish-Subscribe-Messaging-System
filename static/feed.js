// ============================================================
// FEED — For You, Following, Tab Switch
// ============================================================

let currentTab = 'all';
let currentFeedData = null;
let currentKeyword = '';

function showFeed(type, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentTab = type;
    const keyword = document.getElementById('search-input').value.trim();
    if (keyword) {
        searchPosts();
    } else if (type === 'all') {
        getFeed();
    } else {
        getSubFeed();
    }
}

function getFeed() {
    currentTab = 'all';
    const username = sessionStorage.getItem('username');
    fetch('/getPosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => renderFeed(data, ''));
}

function getSubFeed() {
    currentTab = 'sub';
    const username = sessionStorage.getItem('username');
    fetch('/getSubFeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => renderFeed(data, ''));
}
