const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ankit@123',
  database: 'expense_tracker_db'
});

connection.connect((err) => {
  if (err) {
    console.error('User Database connection error:', err.message);
  } else {
    console.log('Connected to the User database.');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS sign_in (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255)
    )`;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating user table:', err.message);
      } else {
        console.log('User Table created or already exists.');
      }
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (bcryptErr, hashedPassword) => {
    if (bcryptErr) {
      console.error('bcrypt error:', bcryptErr.message);
      res.status(500).send('Error hashing password.');
    } else {
      const insertQuery = `INSERT INTO sign_in (username, email, password) VALUES (?, ?, ?)`;
      
      connection.query(insertQuery, [username, email, hashedPassword], (err) => {
        if (err) {
          console.error('Database insert error:', err.message);
          res.status(500).send('Error signing up.');
        } else {
          res.send('Signed up successfully!');
        }
      });
    }
  });
});


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
  });
  

app.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  const selectQuery = `SELECT * FROM sign_in WHERE email = ?`;

  connection.query(selectQuery, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      res.status(500).send('Error logging in.');
    } else {
      if (results.length === 1) {
        const user = results[0];
        req.session.email = email;
        
        // Compare provided password with hashed password
        bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
          if (bcryptErr) {
            console.error('bcrypt error:', bcryptErr.message);
            res.status(500).send('Error comparing passwords.');
          } else {
            if (bcryptResult) {
              // Successful login, send the expense_tracker.html file
              res.redirect("/addexpense");
              //res.sendFile(__dirname + '/views/expense_tracker.html');
            } else {
              res.status(401).send('User not authorized');
            }
          }
        });
      } else {
        res.status(404).send('User not found');
      }
    }
  });
});
app.get('/addexpense', (req, res) => {
  res.sendFile(__dirname + '/views/expense_tracker.html');
});

connection.connect((err) => {
  if (err) {
    console.error('Expense Database connection error:', err.message);
  } else {
    console.log('Connected to the expense database.');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      amount DECIMAL(10, 2),  -- Use DECIMAL for monetary values
      description VARCHAR(255),
      category VARCHAR(255),
      date DATE,
      userID VARCHAR(255),

      FOREIGN KEY (userID) REFERENCES sign_in(email)
    )`;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating expense table:', err.message);
      } else {
        console.log('Expense Table created or already exists.');
      }
    });
  }
});


app.post('/addexpense', (req, res) => {
  const { amount, description, category, email} = req.body;
  const userID = req.body.email; 

  const insertQuery = `INSERT INTO expenses (amount, description, category, userID) VALUES (?, ?, ?, ?)`;

  connection.query(insertQuery, [amount, description, category, email], (err) => {
    if (err) {
      console.error('Database insert error:', err.message);
      res.status(500).send('Error adding expense.');
    } else {
      res.send('Expense added successfully!');
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
