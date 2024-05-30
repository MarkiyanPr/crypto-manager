function uploadFile(event) {
    const file = event.target.files[0];
    console.log('Selected file:', file);

    const formData = new FormData();
    formData.append('file', file);
    console.log("Функція викликана");
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    console.log(token);
    console.log(formData)

    // Check if the token exists
    if (!token) {
        console.error('Token is not stored in localStorage');
        return;
    }

    console.log('Sending request to /upload...');

    console.log('Authorization header:', `Bearer ${token}`);


    // Make a fetch request to upload the file
    localStorage.setItem('token', token); // Де data.accessToken - це токен, отриманий після успішного входу

// Make a fetch request to upload the file
fetch('/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Server log message");
        console.log(data.message); // Log the message returned by the server
    })
    .catch(error => {
        console.error('Error uploading file:', error); // Log any errors that occur during the process
    });
}