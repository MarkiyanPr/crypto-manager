document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }

    fetch('http://localhost:3000/my_files', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = ''; // Clear existing list
        data.files.forEach(file => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="single__file">
                    <p class="file__name">${file}</p>
                    <a href="users folders/${req.user.username}/${file}" class="download__file">Download</a>
                </div>
            `;
            fileList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error fetching files:', error);
    });
});
