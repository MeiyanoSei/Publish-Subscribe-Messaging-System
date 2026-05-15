// ============================================================
// FEED RENDERING — Build and display posts
// ============================================================

// ESCAPE HTML — prevents raw tags from leaking into the DOM
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// FORMAT TIMESTAMP
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return timestamp;
    }
}

// USER COLOR — consistent color per username
function getUserColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 45%)`;
}

// HIGHLIGHT — wraps keyword in <mark> tags on already-escaped text
function highlightText(escapedText, keyword) {
    if (!keyword) return escapedText;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
}

// BUILD POST TEXT — escape → highlight → hashtag spans
function buildPostHtml(rawText, keyword, isTagSearch) {
    let safe = escapeHtml(rawText);
    if (keyword && !isTagSearch) {
        safe = highlightText(safe, keyword);
    }
    safe = safe.replace(
        /#(\w+)/g,
        (match, word) => `<span class="inline-tag" onclick="searchByTag('#${word}')">#${word}</span>`
    );
    return safe;
}

// RENDER FEED
function renderFeed(data, keyword) {
    currentFeedData = data;
    currentKeyword = keyword;

    const feed = document.getElementById('feed');
    feed.innerHTML = '';
    const currentUser = sessionStorage.getItem('username');

    if (!data.feed || data.feed.length === 0) {
        feed.innerHTML = '<p style="padding: 16px; color: #666;">No results found.</p>';
        return;
    }

    const kw = keyword || '';
    const isTagSearch = kw.startsWith('#');

    data.feed.forEach(post => {
        const userColor = getUserColor(post.from);

        const styledUsername = (!isTagSearch && kw)
            ? highlightText(escapeHtml('@' + post.from), kw)
            : escapeHtml('@' + post.from);

        const styledPost = buildPostHtml(post.post || '', kw, isTagSearch);

        const rawTitle = post.title || '';
        const styledTitle = (!isTagSearch && kw)
            ? highlightText(escapeHtml(rawTitle), kw)
            : escapeHtml(rawTitle);

        const styledTimestamp = (!isTagSearch && kw)
            ? highlightText(escapeHtml(post.timestamp || ''), kw)
            : escapeHtml(post.timestamp || '');

        const tagsHtml = post.tags && post.tags.length > 0
            ? `<div class="post-tags">${post.tags.map(tag =>
                `<span class="tag" onclick="searchByTag('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`
              ).join('')}</div>`
            : '';

        let followBtn = '';
        if (post.from !== currentUser) {
            if (userSubscriptions.includes(post.from)) {
                followBtn = `<button class="unfollow-inline-btn" onclick="unfollowUserFromPost('${post.from}')">✓ Following</button>`;
            } else {
                followBtn = `<button class="follow-inline-btn" onclick="followUser('${post.from}')">+ Follow</button>`;
            }
        }

        const titleSection = rawTitle.trim() !== ''
            ? `<h3 class="post-title">${styledTitle}</h3>`
            : '';

        feed.innerHTML += `
            <div class="post">
                <div class="post-header">
                    <span class="username-link" style="color: ${userColor}">${styledUsername}</span>
                    ${followBtn}
                    <span class="post-timestamp">${styledTimestamp}</span>
                </div>
                ${titleSection}
                <p>${styledPost}</p>
                ${post.image ? `<img src="${post.image}" class="post-image">` : ''}
                ${tagsHtml}
            </div>`;
    });

    initPostClicks();
}
