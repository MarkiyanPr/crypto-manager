function uploadFile(event) {
    const file = event.target.files[0];
    console.log('Selected file:', file);

    const formData = new FormData();
    formData.append('file', file);
    console.log("Функція викликана");
    const token = localStorage.getItem('token');
    console.log(token);
    console.log(formData)

    if (!token) {
        console.error('Token is not stored in localStorage');
        return;
    }

    console.log('Sending request to /upload...');

    console.log('Authorization header:', `Bearer ${token}`);


    localStorage.setItem('token', token); 

fetch('/upload', {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${token}` 
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
        console.log(data.message); 
    })
    .catch(error => {
        console.error('Error uploading file:', error); 
    });
}