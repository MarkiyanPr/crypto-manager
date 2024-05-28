function uploadFile(event) {
    const file = event.target.files[0]; // Отримання першого обраного файлу
    const formData = new FormData(); // Створення об'єкту FormData для передачі файлу

    formData.append('file', file); // Додавання файлу до об'єкту FormData

    fetch('/upload', {
        method: 'POST',
        body: formData, // Використання FormData для передачі файлу
        headers: {
            'Authorization': localStorage.getItem('token') // Передача токена авторизації, якщо потрібно
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Виведення повідомлення з сервера
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}
