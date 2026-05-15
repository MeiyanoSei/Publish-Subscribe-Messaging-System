// ============================================================
// PUBLISHING — Create and send posts
// ============================================================

function publish() {
    const title = document.getElementById('post-title').value || '';
    const post = document.getElementById('post-content').value;
    const username = sessionStorage.getItem('username');
    const imageFile = document.getElementById('post-image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('post', post);
    formData.append('username', username);
    if (imageFile) formData.append('image', imageFile);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            closePostPrompt();
            removeImage();
            getFeed();
            showToast('Post published!', 'success');
        } else {
            showToast(data.message, 'error');
        }
    });
}
