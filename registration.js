document.addEventListener('DOMContentLoaded', function () {
    const Regform = document.getElementById('registration-form');
    Regform.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const firstname = document.getElementById('firstname').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordAgain = document.getElementById('passwordAgain').value;
        const responseDiv = document.getElementById('form-response');

        if (!username || !email || !password || !passwordAgain || !firstname || !surname) {
            responseDiv.textContent = 'All fields are required.';
            responseDiv.style.color = 'red';
            return;
        }

        if (password !== passwordAgain) {
            responseDiv.textContent = 'Passwords do not match.';
            responseDiv.style.color = 'red';
            return;
        }

        const userData = {
            username,
            password,
            email,
            firstname,
            surname
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const result = await response.json();

            if (response.ok) {
                responseDiv.textContent = 'Registration successful!';
                responseDiv.style.color = 'green';
            } else {
                responseDiv.textContent = result.message;
                responseDiv.style.color = 'red';
            }
        } catch (error) {
            responseDiv.textContent = 'An error occurred. Please try again.';
            responseDiv.style.color = 'red';
        }
    });


    const Logform = document.getElementById('login-form');
    Logform.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
       
        const password = document.getElementById('password').value;
        const responseDiv = document.getElementById('form-response');

        if (!username || !password ) {
            responseDiv.textContent = 'All fields are required.';
            responseDiv.style.color = 'red';
            return;
        }

       

        const userData = {
            username,
            password
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const result = await response.json();

            if (response.ok) {
                responseDiv.textContent = 'Login successful!';
                responseDiv.style.color = 'green';
            } else {
                responseDiv.textContent = result.message;
                responseDiv.style.color = 'red';
            }
        } catch (error) {
            responseDiv.textContent = 'An error occurred. Please try again.';
            responseDiv.style.color = 'red';
        }
    });
});
