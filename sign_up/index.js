const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to SQLite database
const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the database.');
    // Create the 'users' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT,
      password TEXT
    )`);
  }
});

// Serve signup page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

// Handle form submission
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  
  db.run(insertQuery, [username, email, password], (err) => {
    if (err) {
      console.error('Database insert error:', err.message);
      res.status(500).send('Error signing up.');
    } else {
      res.send('Signed up successfully!');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
