function dragOverHandler(event) {
    event.preventDefault();
    document.getElementById('drop_zone').classList.add('hover');
}

function dropHandler(event) {
    event.preventDefault();
    document.getElementById('drop_zone').classList.remove('hover');

    // Get the files dropped
    const files = event.dataTransfer.files;

    // Upload each file
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('upload.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.error('File upload failed');
        }
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}

function handleFileInput() {
    // Trigger file input click event
    document.getElementById('file_input').click();
}

// Listen for file selection change
document.getElementById('file_input').addEventListener('change', function(event) {
    const files = event.target.files;
    // Upload each file
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
});
