# KinetikTXT
Basic website built on Node.js, EJS, Express.js, Socket.io and mySQL

## Setup
Run create_db.sql

Run index.js

Enter "http://localhost:8000" on your browser

Test account details:
- Username: KinetikTXT
- Email: kt@kt.com
- Password: 123123123

## How to Play
Create an account to play
- Your username can only contain letters, numbers, -, and _.
- Your username should be 2 characters or more
- Your Password should be 8 character or more

Go to the home page

Be the first person to type the word to score a point

## Database Search
- **!all** will return all users in order of their ID
- **!leaderboard** will return all users in order of their Score
- **!loserboard** will return all users in the reverse order of !leaderboard
- **!name** will return all users in order of their Username

## Adding Users
> [!IMPORTANT]
> Adding users is pretty clunky.

**Adding others**
- Go to a user's profile and send a friend request

**Accepting others**
- Go to a user's profile, if they've sent you a friend request you'll see an accept button
- Note: You'll never know if a user has sent you a request unless they tell you or you manually check

**Removing others**
- Go to a user's profile, if you're both friends, you'll be presented with the option to remove them

# API
**/api/stats** will return a table containing the server stats, this includes:

stats structure
- **randomWord** = the current random word being used by the server
- **clientsOnline** = the number of machines connected to the website
- **usersOnline** = the number of machines logged in and connected to the website

**/api/users** will return a table containing all the users

user structure
- **user_id** = the user's ID (unique)
- **username** = the user's username (unique)
- **score** = how many times the user wrote the random word first
- **message_score** = how much of a chatter box the user is (total messages sent)

**/api/users?term=** will return a table containing all the users with usernames containing whatever the term is

```/api/users?term=a```
returns a table with all users who have usernames containing the character "a"

**/api/leaderboard** will return a table containing all the users in order of score
> [!IMPORTANT]
> Queries are not supported for this API route

**/api/chatterbox** will return a table containing all the users in order of message_score (yappaholics)
> [!IMPORTANT]
> Queries are not supported for this API route