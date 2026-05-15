// ============================================================
// SEARCH — Live keyword and hashtag search
// ============================================================

function searchPosts() {
    const keyword = document.getElementById('search-input').value.trim();

    if (!keyword) {
        if (currentTab === 'sub') {
            getSubFeed();
        } else {
            getFeed();
        }
        return;
    }

    // if on following tab, only search within followed users
    const following = currentTab === 'sub' ? userSubscriptions : null;

    fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, following })
    })
    .then(res => res.json())
    .then(data => renderFeed(data, keyword));
}

function searchByTag(tag) {
    document.getElementById('search-input').value = tag;
    searchPosts();
}
