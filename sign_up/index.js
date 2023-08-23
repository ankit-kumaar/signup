const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ankit@123',
  database: 'expense_tracker_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the database.');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS sign_in (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255)
    )`;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table created or already exists.');
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

// app.post('/signup', (req, res) => {
//   const { username, email, password } = req.body;
//   const insertQuery = `INSERT INTO sign_in (username, email, password) VALUES (?, ?, ?)`;
  
//   connection.query(insertQuery, [username, email, password], (err, result) => {
//     if (err) {
//       console.error('Database insert error:', err.message);
//       res.status(500).send('Error signing up.');
//     } else {
//       res.send('Signed up successfully!');
//     }
//   });
// });

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
  });
  
//   app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     const selectQuery = `SELECT * FROM sign_in WHERE email = ? AND password = ?`;
    
//     connection.query(selectQuery, [email, password], (err, results) => {
//       if (err) {
//         console.error('Database query error:', err.message);
//         res.status(500).send('Error logging in.');
//       } else {
//         if (results.length === 1) {
//           res.send('Login successful!');
//         } else {
//           res.send('Invalid email or password.');
//         }
//       }
//     });
//   });

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const selectQuery = `SELECT * FROM sign_in WHERE email = ?`;

  connection.query(selectQuery, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      res.status(500).send('Error logging in.');
    } else {
      if (results.length === 1) {
        const user = results[0];
        
        // Compare provided password with hashed password
        bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
          if (bcryptErr) {
            console.error('bcrypt error:', bcryptErr.message);
            res.status(500).send('Error comparing passwords.');
          } else {
            if (bcryptResult) {
              res.status(200).send('User login successful');
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

  // app.post('/login', (req, res) => {
  //   const { email, password } = req.body;
  //   const selectQuery = `SELECT * FROM sign_in WHERE email = ?`;
  
  //   connection.query(selectQuery, [email], (err, results) => {
  //     if (err) {
  //       console.error('Database query error:', err.message);
  //       res.status(500).send('Error logging in.');
  //     } else {
  //       if (results.length === 1) {
  //         const user = results[0];
  //         if (user.password === password) {
  //           res.status(200).send('User login successful');
  //         } else {
  //           res.status(401).send('User not authorized');
  //         }
  //       } else {
  //         res.status(404).send('User not found');
  //       }
  //     }
  //   });
  // });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
