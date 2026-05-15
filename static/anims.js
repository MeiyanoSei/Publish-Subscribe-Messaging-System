// ============================================================
// ANIMATIONS & UI — Post expand/collapse, popup, tabs, toast, image preview
// ============================================================

// TOAST NOTIFICATION
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `show ${type}`;
    setTimeout(() => {
        toast.className = '';
    }, 3000);
}

// POST PROMPT
function showPostPrompt() {
    document.getElementById('post-prompt').classList.add('active');
}

function closePostPrompt() {
    document.getElementById('post-prompt').classList.remove('active');
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    removeImage();
}

// IMAGE PREVIEW
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('image-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage() {
    document.getElementById('post-image').value = '';
    document.getElementById('preview-img').src = '';
    document.getElementById('image-preview').classList.add('hidden');
}

// SMOOTH EXPAND
function expandPost(post) {
    const fullHeight = post.scrollHeight;
    post.style.maxHeight = fullHeight + 'px';
    post.classList.add('expanded');
    post.addEventListener('transitionend', function handler() {
        if (post.classList.contains('expanded')) {
            post.style.maxHeight = 'none';
            post.style.overflow = 'visible';
        }
        post.removeEventListener('transitionend', handler);
    });
}

// SMOOTH COLLAPSE
function collapsePost(post) {
    post.style.maxHeight = post.scrollHeight + 'px';
    post.style.overflow = 'hidden';
    post.offsetHeight; // force reflow
    post.style.maxHeight = '300px';
    post.classList.remove('expanded');
}

// CHECK OVERFLOW AND ATTACH CLICK
function checkOverflow(post) {
    const isOverflowing = post.scrollHeight > post.clientHeight;
    if (isOverflowing) {
        post.classList.add('overflowing');
        post.style.cursor = 'pointer';
        if (!post.querySelector('.expand-hint')) {
            const hint = document.createElement('div');
            hint.className = 'expand-hint';
            hint.textContent = '▼ Click to expand';
            post.appendChild(hint);
        }
        post.addEventListener('click', function(e) {
            if (
                e.target.tagName === 'BUTTON' ||
                e.target.classList.contains('username-link') ||
                e.target.classList.contains('tag') ||
                e.target.classList.contains('inline-tag') ||
                e.target.classList.contains('expand-hint')
            ) return;

            const hint = this.querySelector('.expand-hint');
            if (this.classList.contains('expanded')) {
                collapsePost(this);
                if (hint) hint.textContent = '▼ Click to expand';
            } else {
                expandPost(this);
                if (hint) hint.textContent = '▲ Click to collapse';
            }
        });
    } else {
        post.classList.remove('overflowing');
        post.style.cursor = 'default';
    }
}

// INIT POST CLICKS — waits for images before checking overflow
function initPostClicks() {
    document.querySelectorAll('.post').forEach(post => {
        const images = post.querySelectorAll('img');
        if (images.length > 0) {
            let loaded = 0;
            images.forEach(img => {
                if (img.complete) {
                    loaded++;
                    if (loaded === images.length) checkOverflow(post);
                } else {
                    img.addEventListener('load', () => {
                        loaded++;
                        if (loaded === images.length) checkOverflow(post);
                    });
                }
            });
        } else {
            checkOverflow(post);
        }
    });
}

// TAB ANIMATION
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// CLOSE POPUP ON BACKGROUND CLICK
document.getElementById('post-prompt').addEventListener('click', function(e) {
    if (e.target === this) {
        closePostPrompt();
    }
});