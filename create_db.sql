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
    score INT DEFAULT 0,
    message_score INT DEFAULT 0
);

-- Create Friendships table
CREATE TABLE Friendships
(
    friendship_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    -- To ensure lonely individuals aren"t adding themselves
    CHECK (sender_id <> receiver_id)
);

-- Create a user and grant privileges
DROP USER IF EXISTS "arobi008"@"localhost";
CREATE USER "arobi008"@"localhost" IDENTIFIED WITH mysql_native_password BY "github";
GRANT ALL PRIVILEGES ON KinetikTXT.* TO "arobi008"@"localhost";

-- PROCEDURES
-- Create User Procedure
-- This Procedure will return a message String (can be null) and a
-- success Boolean that will be true or false
DELIMITER //

CREATE PROCEDURE CreateUser
(
    IN new_username VARCHAR(255),
    IN new_email VARCHAR(255),
    IN new_password VARCHAR(255)
)
BEGIN
    DECLARE count_usernames INT;
    DECLARE count_emails INT;

    -- Check if the username already exists
    SELECT COUNT(*) INTO count_usernames FROM Users WHERE username = new_username;

    -- Check if the email already exists
    SELECT COUNT(*) INTO count_emails FROM Users WHERE email = new_email;

    IF count_usernames > 0 THEN
        SELECT "Username taken" AS message, false AS success;
    ELSEIF count_emails > 0 THEN
        SELECT "Email taken" AS message, false AS success;
    ELSE
        -- Create new user
        INSERT INTO Users (username, email, password) VALUES (new_username, new_email, new_password);
        SELECT NULL AS message, true AS success;
    END IF;
END //

DELIMITER ;

-- Process Friendship Procedure
-- This Procedure will return a message String (can be null) and a
-- success Boolean that will be true or false
DELIMITER //

CREATE PROCEDURE ProcessFriendship
(
    IN new_sender_id INT,
    IN new_receiver_id INT
)
BEGIN
    DECLARE count_users INT;
    DECLARE count_friendships INT;

    -- Check that both the sender and receiver exist
    SELECT COUNT(*) INTO count_users
    FROM Users
    WHERE user_id IN (new_sender_id, new_receiver_id);

    IF count_users != 2 THEN
        SELECT "Sender or receiver does not exist" AS message, false AS success; 
    ELSE
        -- Then check if the friendship already exists
        SELECT COUNT(*) INTO count_friendships 
        FROM Friendships 
        WHERE (sender_id = new_sender_id AND receiver_id = new_receiver_id) 
            OR (sender_id = new_receiver_id AND receiver_id = new_sender_id);

        IF count_friendships != 0 THEN
            -- This means the friendship already exists

            -- Attempt to end the friendship
            DELETE FROM Friendships
            WHERE ((sender_id = new_sender_id AND receiver_id = new_receiver_id)
                OR (sender_id = new_receiver_id AND receiver_id = new_sender_id))
                AND (accepted = TRUE);

            IF ROW_COUNT() = 0 THEN 
                -- Attempt to retract the friendship request
                -- This is because the user who sent the friend request sent it again
                -- In this case we delete it (acts as a toggle)
                DELETE FROM Friendships
                WHERE (sender_id = new_sender_id AND receiver_id = new_receiver_id)
                    AND (accepted = FALSE);

                IF ROW_COUNT() = 0 THEN
                    -- Only accept the friendship if the sender_id and receiver_id 
                    -- are inverse. This means the original receiver of the friendship has
                    -- accepted
                    UPDATE Friendships
                    SET accepted = TRUE
                    WHERE (sender_id = new_receiver_id AND receiver_id = new_sender_id);
                    SELECT "Friendship accepted" AS message, true AS success;
                ELSE
                    SELECT "Friendship request removed" AS message, true AS success;
                END IF;
            ELSE
                SELECT "Friendship ended" AS message, true AS success;
            END IF;
        ELSE
            -- Create new friendship
            INSERT INTO Friendships (sender_id, receiver_id) VALUES (new_sender_id, new_receiver_id);
            SELECT "Friendship request sent" AS message, true AS success;
        END IF;
    END IF;
END //

DELIMITER ;

-- Get Friendship Status Procedure
-- This Procedure will return a message String (can be null) and a
-- success Boolean that will be true or false
DELIMITER //

CREATE PROCEDURE GetFriendshipStatus
(
    IN new_sender_id INT,
    IN new_receiver_id INT
)
BEGIN
    DECLARE count_users INT;
    DECLARE count_friendships INT;
    DECLARE status_friendship INT;
    DECLARE get_sender_id INT;

    -- Check that both the sender and receiver exist
    SELECT COUNT(*) INTO count_users
    FROM Users
    WHERE user_id IN (new_sender_id, new_receiver_id);

    IF count_users != 2 THEN
        SELECT "1 or more users does not exist" AS message, false AS success; 
    ELSE
        -- Then check if the friendship already exists
        SELECT COUNT(*) INTO count_friendships 
        FROM Friendships 
        WHERE (sender_id = new_sender_id AND receiver_id = new_receiver_id) 
            OR (sender_id = new_receiver_id AND receiver_id = new_sender_id);

        IF count_friendships != 0 THEN
            -- This means the friendship already exists
            -- Check the status
            SELECT accepted INTO status_friendship
            FROM Friendships 
            WHERE (sender_id = new_sender_id AND receiver_id = new_receiver_id) 
                OR (sender_id = new_receiver_id AND receiver_id = new_sender_id);

            IF status_friendship != 0 THEN
                -- Friendship accepted
                SELECT "friends" AS status, true AS success;
            ELSE
                -- Friendship pending
                -- Retrieve sender_id here
                SELECT sender_id INTO get_sender_id
                FROM Friendships 
                WHERE (sender_id = new_sender_id AND receiver_id = new_receiver_id) 
                    OR (sender_id = new_receiver_id AND receiver_id = new_sender_id);

                IF get_sender_id = new_sender_id THEN
                    SELECT "sending" AS status, true AS success;
                ELSE
                    SELECT "receiving" AS status, true AS success;
                END IF;
            END IF;
        ELSE
            -- Friendship doesn't exist
            SELECT "none" AS status, true AS success;
        END IF;
    END IF;
END //

DELIMITER ;

-- Get User by Email Procedure
-- This Procedure will return the column values of a user that matches
-- SENSITIVE DATA
DELIMITER //

CREATE PROCEDURE GetUserByEmail(IN targetEmail VARCHAR(255))
BEGIN
    SELECT * FROM Users WHERE email = targetEmail;
END //

DELIMITER ;