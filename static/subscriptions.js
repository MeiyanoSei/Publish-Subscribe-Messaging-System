// ============================================================
// SUBSCRIPTIONS — Follow, Unfollow, Subs List
// ============================================================

// loaded on login, used by feed rendering to show follow/unfollow buttons
let userSubscriptions = [];

function loadSubscriptions() {
    const username = sessionStorage.getItem('username');
    fetch('/getSubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
        userSubscriptions = data.subscriptions || [];
    });
}

function followUser(publisher) {
    const username = sessionStorage.getItem('username');
    fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisher, username })
    })
    .then(res => res.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') {
            userSubscriptions.push(publisher);
            renderFeed(currentFeedData, currentKeyword);
        }
    });
}

function unfollowUserFromPost(publisher) {
    const username = sessionStorage.getItem('username');
    fetch('/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisher, username })
    })
    .then(res => res.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') {
            userSubscriptions = userSubscriptions.filter(p => p !== publisher);
            renderFeed(currentFeedData, currentKeyword);
        }
    });
}

function unfollowUser(publisher) {
    const username = sessionStorage.getItem('username');
    fetch('/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisher, username })
    })
    .then(res => res.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') {
            userSubscriptions = userSubscriptions.filter(p => p !== publisher);
            getSubs();
        }
    });
}

function getSubs() {
    const username = sessionStorage.getItem('username');
    fetch('/getSubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById('subscriptions-list');

        if (list.classList.contains('open')) {
            list.classList.remove('open');
            return;
        }

        list.innerHTML = '';
        if (data.subscriptions.length === 0) {
            list.innerHTML = '<p>Not following anyone yet.</p>';
        } else {
            data.subscriptions.forEach(pub => {
                list.innerHTML += `
                    <div class="sub-item">
                        <span>@${pub}</span>
                        <button class="unfollow-small-btn" onclick="unfollowUser('${pub}')">Unfollow</button>
                    </div>`;
            });
        }
        list.classList.add('open');
    });
}
