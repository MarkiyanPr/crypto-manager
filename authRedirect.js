document.addEventListener('DOMContentLoaded', function() {
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        accountLink.addEventListener('click', function(event) {
            console.log(localStorage.getItem('accessToken'));
            if (localStorage.getItem('accessToken')) {
                window.location.href = '/profile.html'; 
            } else {
                window.location.href = '/registration.html'; 
            }
        });
    }
});