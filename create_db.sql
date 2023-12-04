-- Create a new KinetikTXT database
-- This will DELETE any already existing KinetikTXT database!
DROP DATABASE IF EXISTS KinetikTXT;
CREATE DATABASE KinetikTXT;
USE KinetikTXT;

-- TABLES
-- Create Users table
CREATE TABLE Users 
(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    score INT DEFAULT 0
);

-- Create Friendships table
CREATE TABLE Friendships
(
    friendship_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    FOREIGN KEY (user_id_1) REFERENCES Users(user_id),
    FOREIGN KEY (user_id_2) REFERENCES Users(user_id),
    -- To ensure lonely individuals aren't adding themselves
    CHECK (user_id_1 <> user_id_2)
);

-- Create a user and grant privileges
DROP USER IF EXISTS 'arobi008'@'localhost';
CREATE USER 'arobi008'@'localhost' IDENTIFIED WITH mysql_native_password BY 'github';
GRANT ALL PRIVILEGES ON KinetikTXT.* TO 'arobi008'@'localhost';

-- PROCEDURES
-- Create User Procedure
-- This Procedure will return a message String (can be null) and a
-- success Boolean that will be true or false
DELIMITER //

CREATE PROCEDURE CreateUser
(
    IN newUsername VARCHAR(255),
    IN newEmail VARCHAR(255),
    IN newPassword VARCHAR(255)
)
BEGIN
    DECLARE usernameCount INT;
    DECLARE emailCount INT;

    -- Check if the username already exists
    SELECT COUNT(*) INTO usernameCount FROM users WHERE username = newUsername;

    -- Check if the email already exists
    SELECT COUNT(*) INTO emailCount FROM users WHERE email = newEmail;

    -- Return results
    IF usernameCount > 0 THEN
        SELECT 'Username taken' AS message, false AS success;
    ELSEIF emailCount > 0 THEN
        SELECT 'Email taken' AS message, false AS success;
    ELSE
        -- Insert the new user
        INSERT INTO users (username, email, password) VALUES (newUsername, newEmail, newPassword);
        SELECT NULL AS message, true AS success;
    END IF;
END //

DELIMITER ;

-- Get User by Email Procedure
-- This Procedure will return the column values of a user that matches
DELIMITER //

CREATE PROCEDURE GetUserByEmail(IN targetEmail VARCHAR(255))
BEGIN
    SELECT * FROM Users WHERE email = targetEmail;
END //

DELIMITER ;