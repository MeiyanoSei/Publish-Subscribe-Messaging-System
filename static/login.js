// ============================================================
// AUTH — Login, Register, Logout
// ============================================================

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById('reg-message');
        msg.textContent = data.message;
        msg.className = data.status === 'success' ? 'success' : 'error';

        if (data.status === 'success') {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    sessionStorage.setItem('username', username);
                    sessionStorage.setItem('role', data.role);
                    document.getElementById('auth-section').style.display = 'none';
                    document.getElementById('main-section').classList.remove('hidden');
                    document.getElementById('display-username').textContent = username;
                    if (data.role === 'publisher') {
                        document.getElementById('create-post-btn').style.display = 'inline-block';
                    }
                    loadSubscriptions();
                    getFeed();
                }
            });
        }
    });
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('role', data.role);
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('main-section').classList.remove('hidden');
            document.getElementById('display-username').textContent = username;
            if (data.role === 'publisher') {
                document.getElementById('create-post-btn').style.display = 'inline-block';
            }
            loadSubscriptions();
            getFeed();
        } else {
            const msg = document.getElementById('login-message');
            msg.textContent = data.message;
            msg.className = 'error';
        }
    });
}

function logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    fetch('/logout')
    .then(res => res.json())
    .then(() => {
        location.reload();
    });
}
