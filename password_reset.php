<?php
// Підключення до бази даних SQLite
$db = new SQLite3('database.db');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];

    // Перевірка, чи існує користувач
    $stmt = $db->prepare('SELECT * FROM users WHERE username = :username');
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        echo json_encode(['msg' => 'User not found']);
        exit();
    }

    // Генерація токена
    $resetToken = bin2hex(random_bytes(20));
    $resetExpires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Збереження токена в базі даних
    $stmt = $db->prepare('UPDATE users SET reset_password_token = :resetToken, reset_password_expires = :resetExpires WHERE username = :username');
    $stmt->bindValue(':resetToken', $resetToken, SQLITE3_TEXT);
    $stmt->bindValue(':resetExpires', $resetExpires, SQLITE3_TEXT);
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->execute();

    // Відправка токена користувачу (реально ви би відправили його через email)
    echo json_encode(['resetToken' => $resetToken]);
}
?>