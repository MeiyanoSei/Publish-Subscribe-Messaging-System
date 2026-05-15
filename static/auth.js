document.addEventListener("DOMContentLoaded", function() {
    const signUpButton = document.getElementById('sign-up-btn');
    const logInButton = document.getElementById('log-in-btn');
    const container = document.querySelector('.container');

    if (container) {
        container.classList.add("right-panel-active");

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        logInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    // custom dropdown
    const customSelect = document.getElementById('role-select');
    if (customSelect) {
        const selectedOption = customSelect.querySelector('.selected-option');
        const hiddenInput = document.getElementById('reg-role');

        selectedOption.addEventListener('click', () => {
            customSelect.classList.toggle('open');
        });

        customSelect.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                selectedOption.textContent = option.textContent;
                hiddenInput.value = option.dataset.value;
                customSelect.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });
    }
});