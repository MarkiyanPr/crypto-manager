document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in and redirect accordingly
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        accountLink.addEventListener('click', function(event) {
            if (localStorage.getItem('accessToken')) {
                window.location.href = '/profile.html'; // Redirect to profile page if logged in
            } else {
                window.location.href = '/registration.html'; // Redirect to registration page if not logged in
            }
        });
    }
});