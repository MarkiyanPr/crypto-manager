<?php
// Підключення до бази даних SQLite
$db = new SQLite3('database.db');
require 'password_utils.php'; // Файл для допоміжних функцій, таких як хешування пароля

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $resetToken = $_POST['resetToken'];
    $newPassword = $_POST['newPassword'];

    // Перевірка токена та його терміну дії
    $stmt = $db->prepare('SELECT * FROM users WHERE reset_password_token = :resetToken AND reset_password_expires > datetime("now")');
    $stmt->bindValue(':resetToken', $resetToken, SQLITE3_TEXT);
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        echo json_encode(['msg' => 'Invalid or expired token']);
        exit();
    }

    // Хешування нового пароля
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Оновлення пароля в базі даних
    $stmt = $db->prepare('UPDATE users SET password = :password, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = :resetToken');
    $stmt->bindValue(':password', $hashedPassword, SQLITE3_TEXT);
    $stmt->bindValue(':resetToken', $resetToken, SQLITE3_TEXT);
    $stmt->execute();

    echo json_encode(['msg' => 'Password has been reset']);
}
?>